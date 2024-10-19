import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad, RequestEvent } from "./$types";
import { decodeHex, encodeHex } from "oslo/encoding";
import { createTOTPKeyURI, TOTPController } from "oslo/otp";
import { eq } from "drizzle-orm";
import { Toasty } from "@/utils";
import { users } from "@/db/schemas/shared";
import { APP_NAME } from "$env/static/private";
import { dev } from "$app/environment";
import { Auth } from "@/server/auth";
import { renderSVG } from "uqr";

const IDENTITY_COOKIE = "identity";
const TFA_SECRET_COOKIE = "secrecy";

function destroyCookies(event: RequestEvent) {
	event.cookies.delete(IDENTITY_COOKIE, { path: "/" });
	event.cookies.delete(TFA_SECRET_COOKIE, { path: "/" });
}

export const load: PageServerLoad = async ({ locals, cookies }) => {
	if (locals.user) {
		redirect(302, "/");
	}

	const userId = cookies.get(IDENTITY_COOKIE);
	if (!userId) {
		error(403);
	}

	const result = await locals.context.db.select().from(users).where(eq(users.id, userId));
	const user = result.at(0);
	if (!user || user.id !== userId) {
		cookies.delete(IDENTITY_COOKIE, { path: "/" });
		error(401);
	}

	if (user.tfa !== null) {
		redirect(302, "/auth/otp");
	}

	const twoFactorSecret = crypto.getRandomValues(new Uint8Array(20));
	cookies.set(TFA_SECRET_COOKIE, encodeHex(twoFactorSecret), {
		path: "/",
		httpOnly: true,
		secure: !dev,
	});

	const uri = createTOTPKeyURI(APP_NAME, user.id, twoFactorSecret);
	return {
		secret: uri,
		qr: renderSVG(uri, { border: 1, ecc: "M" }),
	};
};

export const actions: Actions = {
	default: async (event) => {
		const check = await event.locals.limiter.check(event);
		if (check.isLimited) {
			return Toasty.fail(429, `Try again in ${check.retryAfter} seconds`);
		}

		const userId = event.cookies.get(IDENTITY_COOKIE);
		const secret = event.cookies.get(TFA_SECRET_COOKIE);
		if (!secret || !userId) {
			destroyCookies(event);
			error(401);
		}

		const formData = await event.request.formData();
		const otp = formData.get("otp")?.toString();
		if (!otp) {
			return Toasty.fail(422, "Missing Otp code!");
		}

		if (await new TOTPController().verify(otp, decodeHex(secret))) {
			destroyCookies(event);
			const result = await event.locals.context.db
				.update(users)
				.set({ tfa: secret })
				.where(eq(users.id, userId))
				.returning();

			const user = result.at(0);
			if (!user || user.id !== userId) {
				error(401, "Unauthorized");
			}

			const token = Auth.generateSessionToken();
			await Auth.createSession(event.locals.context, token, userId);
			Auth.setCookie(event.cookies, token);

			redirect(302, "/");
		} else {
			return Toasty.fail(400, "Invalid OTP");
		}
	},
};
