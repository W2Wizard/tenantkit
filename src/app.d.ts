import type { Lucia, User, Session } from "lucia";
import type { useRetryAfter } from "@/server/limiter";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { LandlordDB, TenantDB } from "@/db/utils";
import * as shared from "@/db/schemas/shared";
import * as tenant from "@/db/schemas/tenant";
import * as landlord from "@/db/schemas/landlord";

// Define the TenancyContext types directly as a discriminated union
declare global {
	type TenantDB = PostgresJsDatabase<typeof shared & typeof tenant>;
	type LandlordDB = PostgresJsDatabase<typeof shared & typeof landlord>;

	/** Common context properties */
	interface BaseContext {
		/** The tenant / landlord domain (e.g., ocean.campaign.nl | campaign.nl) */
		domain: string;
	}

	/** Landlord context */
	interface LandlordContext extends BaseContext {
		type: "landlord";
		db: LandlordDB;
	}

	/** Tenant context */
	interface TenantContext extends BaseContext {
		type: "tenant";
		db: TenantDB;
		tenant: landlord.TenantsType;
	}

	/** Union of possible tenancy contexts */
	type TenancyContext = LandlordContext | TenantContext;

	// Extend SvelteKit's App namespace
	namespace App {
		interface Locals {
			/** The current authenticated user */
			user: User | null;
			/** The current authenticated session */
			session: shared.Sessions | null;
			/** The current tenant database context (landlord or tenant) */
			context: TenancyContext;
			/** Global rate limiter */
			limiter: ReturnType<typeof useRetryAfter>;
		}
	}
}

export {};
