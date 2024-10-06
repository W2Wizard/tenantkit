// ============================================================================
// W2Inc, Amstelveen 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { ensure } from "@/utils";
import { eq, sql } from "drizzle-orm";
import { tenants } from "@/db/schemas/landlord";
import type { UsersType } from "@/db/schemas/shared";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DB_HOST, DB_PASSWORD, DB_PORT, DB_URL, DB_USER } from "$env/static/private";
import postgres from "postgres";

// Types
// ============================================================================

/**
 * Commonly shared user type between tenant and landlord.
 * This is mainly used to ensure that fetching a user commonly like for example
 * logging in is made easier.
 */
export type User = UsersType;

export async function connect(url: string) {
	const pg = postgres(url, {
		max: 1,
		onnotice(notice) {
			if (notice.severity !== "NOTICE") console.warn("Warning:", notice);
		},
	});

	return { pg, db: drizzle(pg) };
}

// ============================================================================

/** Overall tenancy functionality, mainly CRUD actions */
namespace Tenants {
	/**
	 * Function to declare a new tenant and setup the database.
	 * @param tenantName The new tenant name.
	 * @returns
	 */
	export async function create(ctx: LandlordContext, name: string) {
		const dbName = `tenant_${name.toLowerCase()}`;
		const conTen = await connect(DB_URL);

		await conTen.db.execute(sql.raw(`CREATE DATABASE ${dbName}`)).then(async () => {
			const tenantURL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${dbName}`;

			await conTen.db.insert(tenants).values({
				domain: `${name}.localhost`,
				dbUri: tenantURL,
			});

			await new Promise((resolve) => setTimeout(resolve, 10 * 1000));

			const { db, pg } = await connect(tenantURL);
			await migrate(db, { migrationsFolder: "drizzle/tenant" });
			await pg.end();
		});

		await conTen.pg.end();
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
			where: eq(tenants.domain, domain.hostname),
		});
	}
}

export default Tenants;
