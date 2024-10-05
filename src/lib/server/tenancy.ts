// ============================================================================
// W2Inc, Amstelveen 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { ensure } from "@/utils";
import { eq, sql } from "drizzle-orm";
import { tenants } from "@/db/schemas/landlord";
import type { UsersType } from "@/db/schemas/shared";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Types
// ============================================================================

/**
 * Commonly shared user type between tenant and landlord.
 * This is mainly used to ensure that fetching a user commonly like for example
 * logging in is made easier.
 */
export type User = UsersType;

// ============================================================================

/** Overall tenancy functionality, mainly CRUD actions */
namespace Tenants {
	/**
	 * Function to declare a new tenant and setup the database.
	 * @param tenantName The new tenant name.
	 * @returns
	 */
	export async function create(db: PostgresJsDatabase, name: string, password: string) {
		const dbName = `tenant_${name.toLowerCase()}`;
		const [_, error] = await ensure(db.execute(sql`CREATE DATABASE IF NOT EXISTS ${dbName}`));

		// migrate() ...
		return error ? false : true;
	}

	/**
	 * Remove a tenant, deleting effectively dropping the entire database
	 * @warning BE VERY CAREFUL!
	 * @param tenantName
	 * @returns
	 */
	export async function remove(db: PostgresJsDatabase, tenantName: string) {
		return;
	}

	export async function update(db: PostgresJsDatabase, tenantName: string) {
		return;
	}

	export async function fromDomain(ctx: LandlordContext, domain: URL) {
		return ctx.db.query.tenants.findFirst({
			where: eq(tenants.domain, domain.hostname)
		});
	}
}

export default Tenants;
