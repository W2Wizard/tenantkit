import type { TenantsType } from "@/db/schemas/landlord";
import { writable } from "svelte/store";

// export function useTenantStore() {
// 	let tenants = $state<TenantsType[]>([]);

// 	return {
// 		get tenants() {
// 			return tenants;
// 		},
// 		set tenants(v) {
// 			tenants = v
// 		}
// 	};
// }

export const tenants = writable<TenantsType[]>([]);
