// ============================================================================
// W2Inc, Amsterdam 2023, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { useRetryAfter } from "@/server/limiter";
import { Toasty } from "@/utils";
import { users } from "@/db/schemas/tenant";
import { eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";

// ============================================================================

export const load: PageServerLoad = async ({ locals }) => {
	if (Boolean(env.AUTH_SIGNUP) === false || locals.context.type === "landlord") {
		error(404);
	}
};

export const actions: Actions = {
	default: async (event) => {
		const check = await event.locals.limiter.check(event);
		if (check.isLimited) {
			return Toasty.fail(429, `Try again in ${check.retryAfter} seconds`);
		}

		const { request, cookies, locals } = event;
		const { context } = locals;
		const formData = await request.formData();
		const email = formData.get("email")?.toString();
		const password = formData.get("password")?.toString();
		const password2 = formData.get("c-password")?.toString();

		if (!email || !password || !password2) {
			return Toasty.fail(422, "Invalid email or password");
		}

		if (
			password.length < 8 ||
			!/\d/.test(password) ||
			!/[a-z]/.test(password) ||
			!/[A-Z]/.test(password)
		) {
			return Toasty.fail(
				422,
				"Password must be at least 8 characters long and contain at least one number, one lowercase letter, and one uppercase letter"
			);
		}

		if (password !== password2) {
			return Toasty.fail(422, "Passwords do not match!");
		}

		// Wait a random 25 - 400 ms to prevent timing attacks
		// Returning immediately allows malicious actors to figure out valid usernames from response times
		// By always returning the same / inconsistent response time, we can make it harder to figure out valid usernames
		await new Promise((resolve) => setTimeout(resolve, 25 + Math.random() * 400));

		// Exists ?
		if ((await context.db.select().from(users).where(eq(users.email, email))).length > 1) {
			return Toasty.fail(409, "Account with such an email already exists!");
		}

		const user = await context.db.transaction(async (tx) => {
			const id = generateIdFromEntropySize(16);
			const hash = await Bun.password.hash(password, "argon2id");
			const user = await tx
				.insert(users)
				.values({
					email,
					id,
					hash,
					tfa: null,
				})
				.returning();
			const createdUser = user.at(0);
			if (!createdUser) tx.rollback();
			return createdUser;
		});

		if (!user) {
			return Toasty.fail(500, "Failed to create account");
		}

		cookies.set("identity", user.id, {
			path: "/",
			secure: !dev,
			sameSite: "strict",
		});

		redirect(302, "/auth/otp/setup");
	},
};
