// ============================================================================
// W2Inc, Amsterdam 2023, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Lucia, generateId } from "lucia";
import { TimeSpan, createDate } from "oslo";
import { alphabet, generateRandomString, sha256 } from "oslo/crypto";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { dev } from "$app/environment";
import { resetTokens, verificationTokens } from "../db/schemas/landlord";
import { eq } from "drizzle-orm";
import { sessions, users } from "@/db/schemas/shared";
import type { Sessions } from "@/db/schemas/shared";
import type { User } from "./tenancy";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import type { Cookies, RequestEvent } from "@sveltejs/kit";

// ============================================================================

// ============================================================================

/**
 * Lucia Auth is like our "session driver" as it makes the requests for use
 * to handle authentication verification etc
 * @param db The database.
 * @returns A new lucia auth instance
 *
 * TODO: Any is bad here but really doesn't matter as we don't need anything from
 * it... for now.
 */
export function createLucia(db: PostgresJsDatabase<any>, domain: string) {
	return new Lucia(new DrizzlePostgreSQLAdapter(db, sessions, users), {
		sessionCookie: {
			attributes: {
				secure: !dev,
				sameSite: "strict",
				domain,
			},
		},
		// getUserAttributes: (attributes) => {
		// 	return {
		// 		requires2fa: attributes.tfa !== null
		// 	};
		// }
	});
}

export type LuciaType = ReturnType<typeof createLucia>;

// ============================================================================

export namespace Auth {
	/** The length of the reset token. */
	export const RESET_TOKEN_LENGTH = 40;
	/** The length of the verification code. */
	export const VERIFICATION_CODE_LENGTH = 8;
	/** The length of a valid session. */
	export const SESSION_EXPIRES = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
	/** The session cookie name */
	export const SESSION_COOKIE = "session";

	const hasher = new Bun.CryptoHasher("sha256");

	export type SessionValidationResult =
		| { session: Sessions; user: User }
		| { session: null; user: null };

	/**
	 * Generates a new session token
	 * @returns The token.
	 */
	export function generateSessionToken(): string {
		const bytes = new Uint8Array(20);
		crypto.getRandomValues(bytes);
		const token = encodeBase32LowerCaseNoPadding(bytes);
		return token;
	}

	/**
	 *
	 * @param ctx
	 * @param token
	 * @param userId
	 * @returns
	 */
	export async function createSession(
		ctx: TenancyContext,
		token: string,
		userId: string
	): Promise<Sessions> {
		const session: Sessions = {
			userId,
			id: hasher.update(token).digest().toString("base64"),
			expiresAt: SESSION_EXPIRES,
		};

		await ctx.db.insert(sessions).values(session);
		return session;
	}

	/**
	 *
	 * @param ctx
	 * @param token
	 * @returns
	 */
	export async function validateSessionToken(
		ctx: TenancyContext,
		token: string
	): Promise<SessionValidationResult> {
		const sessionId = hasher.update(token).digest().toString("base64");
		const result = await ctx.db
			.select({ user: users, session: sessions })
			.from(sessions)
			.innerJoin(users, eq(sessions.userId, users.id))
			.where(eq(sessions.id, sessionId));

		if (result.length < 1) {
			return { session: null, user: null };
		}
		const { user, session } = result[0];
		if (Date.now() >= session.expiresAt.getTime()) {
			await ctx.db.delete(sessions).where(eq(sessions.id, session.id));
			return { session: null, user: null };
		}
		if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
			session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
			await ctx.db
				.update(sessions)
				.set({
					expiresAt: session.expiresAt,
				})
				.where(eq(sessions.id, session.id));
		}
		return { session, user };
	}

	/**
	 *
	 * @param ctx
	 * @param sessionId
	 */
	export async function invalidateSession(ctx: TenancyContext, id: string) {
		await ctx.db.delete(sessions).where(eq(sessions.id, id));
	}

	/**
	 *
	 * @param ctx
	 * @param sessionId
	 */
	export async function invalidateSessions(ctx: TenancyContext, userId: string) {
		await ctx.db.delete(sessions).where(eq(sessions.userId, userId));
	}

	/**
	 * Creates a password reset token for the user.
	 * Deletes any existing token for the user.
	 * @param userId
	 * @returns
	 */
	export async function createResetToken(ctx: TenancyContext, userId: string) {
		return await ctx.db.transaction(async (tx) => {
			const tokenId = generateId(RESET_TOKEN_LENGTH);
			const expiresAt = createDate(new TimeSpan(30, "m"));

			await tx.delete(resetTokens).where(eq(resetTokens.userId, userId));
			await tx.insert(resetTokens).values({
				id: tokenId,
				userId,
				expiresAt,
			});

			return tokenId;
		});
	}

	/**
	 * Creates a verification code for the user.
	 * @param userId The user's ID.
	 * @param email The user's email.
	 * @returns The verification code.
	 */
	export async function createVerificationCode(ctx: TenancyContext, userId: string, email: string) {
		return await ctx.db.transaction(async (tx) => {
			await tx.delete(verificationTokens).where(eq(verificationTokens.userId, userId));
			const code = generateRandomString(VERIFICATION_CODE_LENGTH, alphabet("0-9"));

			await tx.insert(verificationTokens).values({
				expiresAt: createDate(new TimeSpan(5, "m")),
				userId,
				email,
				code,
			});

			return code;
		});
	}

	//== Cookies ==//

	/**
	 *
	 * @param event
	 * @param token
	 * @param expiresAt
	 */
	export function setCookie(
		cookies: Cookies,
		token: string,
		expiresAt: Date = SESSION_EXPIRES,
		domain?: string
	) {
		cookies.set(SESSION_COOKIE, token, {
			httpOnly: true,
			sameSite: "lax",
			domain,
			expires: expiresAt,
			path: "/",
			secure: !dev,
		});
	}

	/**
	 *
	 * @param event
	 */
	export function deleteCookie(cookies: Cookies): void {
		cookies.delete(SESSION_COOKIE, {
			httpOnly: true,
			sameSite: "lax",
			secure: !dev,
			maxAge: 0,
			path: "/",
		});
	}
}
