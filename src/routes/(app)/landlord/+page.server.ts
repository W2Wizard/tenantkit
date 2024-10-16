// ============================================================================
// W2Inc, Amsterdam 2023, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { tenants } from "@/db/schemas/landlord";
import Tenants from "@/server/tenancy";
import { z } from "zod";
import { ensure, FormSchema, Toasty, validate } from "@/utils";
import { invalidate } from "$app/navigation";

// ============================================================================

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (locals.context.type === "tenant") error(404);
	depends("landlord:tenants");

	const { db } = locals.context;
	return {
		tenants: db.select().from(tenants),
	};
};

// Schemas
// ============================================================================

const deleteSchema = z.object({
	id: z.string().uuid().readonly(),
});

const createSchema = z.object({
	name: z.string().min(3, "Needs to be at least 3 characters"),
});

// ============================================================================

export const actions: Actions = {
	delete: async (event) => {
		const {
			request,
			locals: { context },
		} = await validate(event);
		const formData = Object.fromEntries(await request.formData());
		const form = await deleteSchema.safeParseAsync(formData);

		if (!form.success) {
			return Toasty.fail(
				400,
				"Invalid form",
				FormSchema.formatErrors(form.error.issues),
			);
		}

		const [r, e] = await ensure(Tenants.remove(context, form.data.id));
		if (r) {
			return Toasty.success(`Tenant: ${r.domain} has been deleted`);
		} else if (e) {
			return Toasty.fail(422, "Failed to delete tenant", e);
		}
	},
	create: async (event) => {
		const {
			request,
			locals: { context },
		} = await validate(event);

		const formData = Object.fromEntries(await request.formData());
		const form = await createSchema.safeParseAsync(formData);
		if (!form.success) {
			return Toasty.fail(
				400,
				"Invalid form",
				FormSchema.formatErrors(form.error.issues),
			);
		}

		const [r, e] = await ensure(Tenants.create(context, form.data.name));
		if (e) return Toasty.fail(400, e.message);
		return Toasty.success("Tenant created");
	},
};
