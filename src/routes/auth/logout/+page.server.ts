// ============================================================================
// W2Inc, Amsterdam 2023, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { Auth } from "@/server/auth";

// ============================================================================

export const load: PageServerLoad = async ({}) => {
	// if (!locals.session) {
	// 	return fail(400, { message: "No session" });
	// }

	// await lucia.invalidateSession(locals.session.id);
	// cookies.delete(lucia.sessionCookieName, { path: "/" });
	// return { }
	redirect(302, "/");
};

export const actions: Actions = {
	default: async ({ cookies, locals }) => {
		if (!locals.session) {
			return fail(400, { message: "No session" });
		}

		console.log("yeet");

		await Auth.invalidateSession(locals.context, locals.session.id);
		Auth.deleteCookie(cookies);
		redirect(302, "/auth/signin");
	},
};
