// ============================================================================
// W2Inc, Amsterdam 2023, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import Tenants from "@/server/tenancy";
import { Auth, createLucia } from "$lib/server/auth";
import TTLCache from "@isaacs/ttlcache";
import { redirect, type Handle, error, type RequestEvent } from "@sveltejs/kit";
import { drizzle } from "drizzle-orm/postgres-js";
import { PGIDLE_TIMEOUT, DB_URL, APP_NAME } from "$env/static/private";
import postgres from "postgres";
import { useRetryAfter } from "@/server/limiter";
import * as sharedSchema from "@/db/schemas/shared";
import * as tenantSchema from "@/db/schemas/tenant";
import * as landlordSchema from "@/db/schemas/landlord";
import { ensure } from "@/utils";
import { sequence } from "@sveltejs/kit/hooks";
import { env } from "$env/dynamic/private";
import { createClient } from "@redis/client";

// Configs
// ============================================================================

/** All currently available tenant connections being maintained by the backend */
const connections = new TTLCache<string, TenancyContext>({
	ttl: Number(PGIDLE_TIMEOUT) * 1000,
	max: 256
});

/**
 * Global rate limiting, you can use this rate limiter across pages or use
 * a new rate limiter to determine rate limits per page if so desired.
 */
const limiter = useRetryAfter({
	IP: [10, "h"],
	IPUA: [60, "m"]
});

/**
 * You can specify if a route requires authentication, by default every
 * route requires it. But you can overwrite the behaviour here.
 */
const routes: Record<string, boolean> = {
	"/demo": false
};

const redis = createClient({ url: env.REDIS_URL });
await redis.connect();

// ============================================================================

export const handleRedis: Handle = async ({ event, resolve }) => {
	const { url } = event;

	if (url.pathname.startsWith("/auth")) return resolve(event);

	// Create a unique key to store the page in the
	// cache. I'm using "rendered" to differentiate
	// entries from other data in Redis and the "v1"
	// will allow invalidating the entire cache if
	// the application code will change rendering.
	// For a blog, I don't want to alter the cache
	// on every querystring parameter otherwise it
	// reduces the cache hit-rate due to parameters
	// other sites may add (such as "fbclid").
	const key = `rendered:v1:${url.pathname}`;

	// ideally this is the only network request that
	// we make ... it will return an empty object if
	// the page wasn't cached or a populated object
	// containing body and headers
	let cached = await redis.hGetAll(key);
	if (!cached.body) {
		// if it wasn't cached, we render the pages
		const response = await resolve(event);

		// then convert it into a cachable object
		cached = Object.fromEntries(response.headers.entries());
		cached.body = await response.text();

		if (response.status === 200) {
			// and write it to the Redis cache ...
			// NOTE: although this returns a promise
			// we don't await it, so we don't delay
			// returning the response to the client
			// (the cache write is "fire and forget")
			redis.hSet(key, cached);
		}
	}

	// we end up here with the same object whether
	// it came from the cache or was rendered fresh
	// and we just return it as the response
	const { body, ...headers } = cached;
	return new Response(body, { headers: new Headers(headers) });
};

// ============================================================================

/**
 * Resolve the correct DB Connection (tenant or landlord)
 * @param event The request event.
 * @returns The event set with the correct data.
 */
const handleTenant: Handle = async ({ event, resolve }) => {
	const retrieveContext = (key: string, uri: string, type: "landlord" | "tenant") => {
		if (!connections.has(key)) {
			const schema =
				type === "landlord" ? { ...landlordSchema, ...sharedSchema } : { ...tenantSchema, ...sharedSchema };

			// NOTE(W2): This is technically correct. Retrieve context can be used for both
			const db = drizzle(postgres(uri, { max: 24 }), { schema }) as LandlordDB | TenantDB;
			// @ts-ignore
			connections.set(key, {
				type,
				db,
				domain: event.url.hostname
			});
		}
		return connections.get(key)!;
	};

	const parts = event.url.hostname.split(".");
	if (parts.length > 2) {
		error(404);
	}

	// NOTE: We always ensure a landlord connection no matter what.
	const landlord = retrieveContext("landlord", DB_URL, "landlord") as LandlordContext;
	if (!landlord) {
		error(503, "Landlord is unavailble");
	} else if (parts.length === 1) {
		event.locals.context = landlord;
		return resolve(event);
	}

	const tenant = await Tenants.fromDomain(landlord, event.url);
	if (!tenant) error(404);

	event.locals.context = retrieveContext(event.url.hostname, tenant.dbUri, "tenant");
	return resolve(event);
};

// ============================================================================

/**
 * The handle hook runs every time the SvelteKit server receives a request and
 * determines the response. Essentially it's middleware.
 *
 * @see https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks
 */
export const handleAuth: Handle = async ({ event, resolve }) => {
	event.locals.limiter = limiter;
	event.setHeaders({
		"x-powered-by": `Bun ${Bun.version}`,
		"x-application": APP_NAME
	});

	// Verify session
	const token = event.cookies.get(Auth.SESSION_COOKIE) ?? null;
	if (!token) {
		event.locals.user = null;
		event.locals.session = null;

		// Allow non-authenticated access if the route doesn't require authentication
		if (routes[event.url.pathname] === false) {
			return resolve(event);
		}
		// User is trying to sign in.
		if (event.url.pathname.startsWith("/auth")) {
			return resolve(event);
		}
		// If route requires authentication and no session exists, redirect to signin
		return redirect(301, "/auth/signin");
	}

	// Validate & Create session
	const [r, e] = await ensure(Auth.validateSessionToken(event.locals.context, token));
	if (e) error(503, e.message);
	const { session, user } = r;

	if (session !== null) {
		Auth.setCookie(event.cookies, token, session.expiresAt, event.locals.context.domain);

		event.locals.user = user;
		event.locals.session = session;
	} else {
		Auth.deleteCookie(event.cookies);
	}

	// Landlord application must only have access to the landlord route
	if (
		!event.url.pathname.startsWith("/landlord") &&
		event.locals.context.type === "landlord" &&
		!event.url.pathname.startsWith("/auth")
	) {
		redirect(303, "/landlord");
	}

	return resolve(event);
};

/**
 * The order of these things IS important!
 *
 * 1. Determine which tenant we're connecting to...
 * 2. Handle any sort of authentication...
 * 3. Handle redis cache...
 */
export const handle = sequence(handleTenant, handleAuth);
