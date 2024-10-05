import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { tenants } from "@/db/schemas/landlord";

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.context.type === "tenant") error(404);

	const { db } = locals.context;

	return {
		tenants: db.select().from(tenants)
	};
};
