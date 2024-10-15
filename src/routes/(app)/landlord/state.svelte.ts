import { writable } from "svelte/store";
import type { TenantsType } from "@/db/schemas/landlord";

export const tenant = writable<TenantsType | null>(null);
export const tenants = writable<TenantsType[]>([]);
