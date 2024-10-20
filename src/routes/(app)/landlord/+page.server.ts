// ============================================================================
// W2Inc, Amsterdam 2023, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { z } from "zod";
import { error } from "@sveltejs/kit";
import Tenants from "@/server/tenancy";
import { tenants } from "@/db/schemas/landlord";
import type { Actions, PageServerLoad } from "./$types";
import { ensure, Toasty, validateEventForm } from "@/utils";

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

const updateSchema = z.object({
	id: z.string().uuid().readonly(),
	name: z.string().min(3, "Needs to be at least 3 characters"),
	domain: z.string().min(3, "Needs to be at least 3 characters"),
});

const deleteSchema = z.object({
	id: z.string().uuid().readonly(),
});

const createSchema = z.object({
	name: z.string().min(3, "Needs to be at least 3 characters"),
});

// ============================================================================

export const actions: Actions = {
	update: async (event) => {
		const { evt, form } = await validateEventForm(event, updateSchema);
		if (!form.success) {
			console.log(form.error.issues);
			return Toasty.bad(400, form.error.issues);
		}

		const {
			locals: { context },
		} = evt;
		const [_, e] = await ensure(
			Tenants.update(context, form.data.id, {
				name: form.data.name,
				domain: form.data.domain,
			})
		);

		if (e) return Toasty.fail(422, e.message);
		return Toasty.success("Tenant updated");
	},
	delete: async (event) => {
		const { evt, form } = await validateEventForm(event, deleteSchema);
		if (!form.success) {
			return Toasty.bad(400, form.error.issues);
		}

		const {
			locals: { context },
		} = evt;
		const [r, e] = await ensure(Tenants.remove(context, form.data.id));
		if (e) return Toasty.fail(422, e.message);
		return Toasty.success(`Tenant: ${r!.domain} has been deleted`);
	},
	create: async (event) => {
		const { evt, form } = await validateEventForm(event, createSchema);
		if (!form.success) {
			return Toasty.bad(400, form.error.issues);
		}

		const {
			locals: { context },
		} = evt;
		const [r, e] = await ensure(Tenants.create(context, form.data.name));
		if (e) return Toasty.fail(400, e.message);
		return Toasty.success("Tenant created");
	},
};
