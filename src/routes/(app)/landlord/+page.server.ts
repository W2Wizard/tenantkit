import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { tenants } from "@/db/schemas/landlord";
import Tenants from "@/server/tenancy";
import { ensure, Toasty } from "@/utils";

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (locals.context.type === "tenant") error(404);

	depends("landlord:tenants");

	const { db } = locals.context;
	return {
		tenants: db.select().from(tenants)
	};
};

export const actions: Actions = {
	default: async (event) => {
		const check = await event.locals.limiter.check(event);
		if (check.isLimited) {
			error(429, `Try again in ${check.retryAfter} seconds`);
		}

		const { request, locals } = event;
		const { context } = locals;
		const formData = await request.formData();
		const name = formData.get("name")?.toString();

		if (!name || !/^[a-zA-Z]+$/.test(name)) {
			return Toasty.fail(400, "Invalid name");
		}

		if (context.type !== "landlord") {
			error(401);
		}

		const [r, e] = await ensure(Tenants.create(context, name));
		if (e) return Toasty.fail(400, e.message);
		return Toasty.success("Tenant created");
	}
};
