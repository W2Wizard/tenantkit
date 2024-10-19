// ============================================================================
// W2Inc, Amstelveen 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import { browser } from "$app/environment";
import { getContext, setContext } from "svelte";
import { error, fail as kitFail, type RequestEvent } from "@sveltejs/kit";
import { writable, type Updater } from "svelte/store";
import type { TransitionConfig } from "svelte/transition";
import type { z } from "zod";

// Tailwind utilities
// ============================================================================

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t,
			});
		},
		easing: cubicOut,
	};
};

// ============================================================================

export const isBrowser = typeof document !== "undefined" || browser;

/**
 * A custom store that only allows updating the value from the
 * browser to avoid SSR data leaks.
 * @param initialValue The initial value of the store
 * @returns A writable store
 */
export function clientWritable<T>(initialValue: T) {
	const store = writable(initialValue);

	function set(value: T) {
		if (browser) {
			store.set(value);
		}
	}

	function update(updater: Updater<T>) {
		if (browser) {
			store.update(updater);
		}
	}

	return {
		subscribe: store.subscribe,
		set,
		update,
	};
}

/**
 * Client side context store, the value won't be available on the server
 * nor will it be reactive.
 * @param key The key of the context
 * @returns Functions to get and set the context
 */
export function useContext<T>(key: unknown) {
	return {
		get: () => getContext<T>(key),
		set: (value: T) => setContext(key, value),
	};
}

export async function useFileReader(file: File) {
	const reader = new FileReader();

	return new Promise<string>((resolve, reject) => {
		reader.addEventListener("error", () => reject(reader.error));
		reader.addEventListener("load", () => resolve(reader.result as string));
		reader.readAsDataURL(file);
	});
}

export namespace API {
	export async function fetchy<T = unknown>(
		route: string,
		init?: RequestInit & { fetch?: typeof fetch }
	) {
		const fetchy = init?.fetch ?? fetch;
		const response = await fetchy(route, {
			signal: AbortSignal.timeout(1000),
			...init,
		});

		if (!response.ok) {
			error(response.status, response.statusText);
		}

		return (await response.json()) as T;
	}
}

/**
 * Check that the event is permitted to do the action.
 * E.g: Rate limit, application type...
 *
 * @template T The context underwhich this event should be registered.
 *
 * @param event The Event to check.
 * @param type The type of context to check against ("landlord" or "tenant").
 * @warning DO NOT CATCH THIS METHOD!
 * @returns The event, useful for chaining.
 */
export async function validate<
	E extends RequestEvent,
	T extends "landlord" | "tenant" = "landlord",
>(event: E, type?: T) {
	const {
		locals: { context },
	} = event;
	const contextType = type ?? "landlord";
	const check = await event.locals.limiter.check(event);
	if (check.isLimited) {
		error(429, `Try again in ${check.retryAfter} seconds`);
	}

	if (context.type !== contextType) {
		error(401, "Unauthorized access");
	}

	// Return the event, ensuring the type matches the specific context
	return event as E & {
		locals: { context: T extends "landlord" ? LandlordContext : TenantContext };
	};
}

/**
 * Wrapper for validating the event, and checking that the form data matches
 * the schema.
 *
 * If user is rate limited they get a 401, if schema is bad you can check.
 *
 * @param event The Request event
 * @param schema The schema to use for parsing
 * @param type The nature of the request.
 * @returns The event and validated schema.
 */
export async function validateEventForm<
	E extends RequestEvent,
	S extends z.ZodRawShape,
	T extends "landlord" | "tenant" = "landlord",
>(event: E, schema: z.ZodObject<S>, type?: T) {
	const { request } = await validate(event, type ?? "landlord");
	const formData = Object.fromEntries(await request.formData());
	await schema.safeParseAsync(formData);
	return {
		evt: event as E & {
			locals: {
				context: T extends "landlord" ? LandlordContext : TenantContext;
			};
		},
		form: await schema.safeParseAsync(formData),
	};
}

export function slugify(str: string) {
	return String(str)
		.normalize("NFKD") // split accented characters into their base characters and diacritical marks
		.replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
		.trim() // trim leading or trailing whitespace
		.toLowerCase() // convert to lowercase
		.replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters
		.replace(/\s+/g, "-") // replace spaces with hyphens
		.replace(/-+/g, "-"); // remove consecutive hyphens
}

/** Wrapper functions for handling universal toasts by awaited forms.*/
export namespace Toasty {
	/**
	 * Universal way to just simply return a failure with a message.
	 * @param status The status code of the failure
	 * @param message The message of the failure
	 * @returns
	 */
	export function fail<T>(status: number, message: string, rest: T = undefined as T) {
		return kitFail(status, { message, ...rest });
	}

	/**
	 * Universal way to fail based on a bad schema
	 * @param status The status code of the failure
	 * @param message The message of the failure
	 * @returns
	 */
	export function bad(status: number = 400, issues: z.ZodIssue[]) {
		return kitFail(400, {
			issues: issues.map((error) => {
				return {
					field: error.path[0],
					message: error.message,
				};
			}),
		});
	}

	/**
	 * Universal way to just simply return a success with a message.
	 * @param message The message of the success
	 * @param rest Any other data to return
	 * @returns
	 */
	export function success<T>(message: string, rest: T = undefined as T) {
		return { message, ...rest };
	}
}

/**
 * ENSURE that the promise is resolved safely and return the appropriate result.
 * @param promise The promise to ensure / await.
 * @returns Either the result or an error.
 */
export async function ensure<T, E = Error>(promise: Promise<T>): Promise<[T, null] | [null, E]> {
	try {
		const result = await promise;
		return [result, null];
	} catch (error) {
		return [null, error as E];
	}
}
