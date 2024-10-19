import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { decodeHex } from "oslo/encoding";
import { TOTPController } from "oslo/otp";
import { eq } from "drizzle-orm";
import { Toasty } from "@/utils";
import { users } from "@/db/schemas/shared";
import { Auth } from "@/server/auth";

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const userId = cookies.get("identity");
	if (!userId) {
		return error(401, "Unauthorized");
	}

	if (locals.user && locals.session) {
		return redirect(302, "/");
	}

	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const check = await event.locals.limiter.check(event);
		if (check.isLimited) {
			return Toasty.fail(429, `Try again in ${check.retryAfter} seconds`);
		}

		const { locals, cookies, request } = event;
		const { db } = locals.context;

		const userId = cookies.get("identity");
		if (!userId) {
			error(401, "Unauthorized");
		}

		const formData = await request.formData();
		const otp = formData.get("otp")?.toString();
		if (!otp) {
			cookies.delete("identity", { path: "/" });
			error(401, "Unauthorized");
		}

		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user || user.id !== userId) {
			cookies.delete("identity", { path: "/" });
			error(401, "Unauthorized");
		}
		if (!user.tfa) {
			redirect(302, "/auth/otp/setup");
		}

		// Validate the OTP
		if (await new TOTPController().verify(otp, decodeHex(user.tfa))) {
			cookies.delete("identity", { path: "/" });

			const token = Auth.generateSessionToken();
			await Auth.createSession(event.locals.context, token, userId);
			Auth.setCookie(cookies, token);
			return redirect(301, event.locals.context.type === "landlord" ? "/landlord" : "/");
		} else {
			return Toasty.fail(400, "Invalid OTP");
		}
	},
};
