// ============================================================================
// W2Inc, Amsterdam 2023, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { Auth } from "$lib/server/auth";
import { resetTokens, users } from "@/db/schemas/shared";
import { resend } from "@/mail";
import { isWithinExpirationDate } from "oslo";
import { useRetryAfter } from "@/server/limiter";
import { Toasty } from "$lib/utils";
import { eq } from "drizzle-orm";
import { env } from "$env/dynamic/private";

const limiter = useRetryAfter({
	IP: [10, "h"],
	IPUA: [1, "m"],
});

// ============================================================================

export const load: PageServerLoad = async ({ url, locals }) => {
	if (Boolean(env.AUTH_FORGOT) === false || locals.context.type === "landlord") {
		error(404);
	}

	const tokenQuery = url.searchParams.get("token");
	if (
		!url.searchParams.has("token") ||
		!tokenQuery ||
		tokenQuery.length !== Auth.RESET_TOKEN_LENGTH
	)
		return { token: null };

	const tokens = await locals.context.db
		.select()
		.from(resetTokens)
		.where(eq(resetTokens.id, tokenQuery));
	const token = tokens.at(0);

	if (!token || !isWithinExpirationDate(new Date(token.expiresAt))) {
		error(400, "Invalid token");
	}
	return { token: tokenQuery };
};

// ============================================================================

export const actions: Actions = {
	// Send the password reset link
	request: async (event) => {
		const check = await limiter.check(event);
		if (check.isLimited) {
			Toasty.fail(420, `Try again in ${check.retryAfter} seconds`);
		}

		const formData = await event.request.formData();
		const email = formData.get("email")?.toString();
		const message = "If your email exists / is verified, you will receive a password reset link";

		// Wait a random 125 - 250 ms to prevent timing attacks
		await new Promise((resolve) => setTimeout(resolve, 125 + Math.random() * 125));

		if (
			!email ||
			email.length < 3 ||
			email.length > 255 ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
		)
			return Toasty.fail(400, message);

		const usersData = await event.locals.context.db
			.select()
			.from(users)
			.where(eq(users.email, email));
		const user = usersData.at(0);
		if (!user || !user.verified) {
			return Toasty.fail(400, message);
		}

		// TODO: Use custom email template
		const token = Auth.createResetToken(event.locals.context, user.id);
		const link = `http://localhost:5173/auth/forgot?token=${token}`;
		resend.emails.send({
			from: "onboarding@resend.dev",
			to: user.email,
			subject: "Password reset request",
			html: `
			<p>Click the link below to reset your password</p>
			<p>If you didn't request this, you can ignore this email, probably change your password</p>
			<a href="${link}">Reset your password</a>
			`,
		});

		return Toasty.success(message);
	},
	// Reset the password
	reset: async ({ request, cookies, locals }) => {
		const formData = await request.formData();
		const tokenQuery = formData.get("token")?.toString();
		const password = formData.get("new-password")?.toString();
		// const password2 = formData.get('new-password2')?.toString();
		if (!tokenQuery || tokenQuery.length !== Auth.RESET_TOKEN_LENGTH) {
			error(400, "Invalid token");
		}
		// if (password1 !== password2) {
		// 	console.log(password1, password2);
		// 	return Toasty.fail(422, "Password do not match!")
		// }

		// const password = password1;
		if (!password || password.length < 8) {
			return Toasty.fail(400, "Invalid password, must be at least 8 characters.");
		}

		// Verify the token
		const tokens = await locals.context.db
			.select()
			.from(resetTokens)
			.where(eq(resetTokens.id, tokenQuery))
			.limit(1);
		const token = tokens.at(0);

		if (token) await locals.context.db.delete(resetTokens).where(eq(resetTokens.id, token.id));
		if (!token || !isWithinExpirationDate(new Date(token.expiresAt))) {
			error(400, "Invalid token");
		}

		// TODO: Compare the hashes to see if the password is the same?
		await Auth.invalidateSessions(locals.context, token.userId);
		const hashedPassword = await Bun.password.hash(password, "argon2id");
		await locals.context.db
			.update(users)
			.set({ hash: hashedPassword })
			.where(eq(users.id, token.userId));

		const sessionToken = Auth.generateSessionToken();
		await Auth.createSession(locals.context, sessionToken, token.userId);
		Auth.setCookie(cookies, sessionToken);

		redirect(302, "/");
	},
};
