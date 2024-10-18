import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals: { context } }) => {
	return {
		type: context.type,
		tenant: context.type === "tenant" ? context.tenant : null,
	};
};
