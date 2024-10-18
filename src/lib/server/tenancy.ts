// ============================================================================
// W2Inc, Amstelveen 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { ensure, slugify, Toasty } from "@/utils";
import { eq, sql } from "drizzle-orm";
import { tenants } from "@/db/schemas/landlord";
import type { UsersType } from "@/db/schemas/shared";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
	DB_HOST,
	DB_PASSWORD,
	DB_PORT,
	DB_URL,
	DB_USER,
} from "$env/static/private";
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
		const slug = slugify(name);
		const dbName = `tenant_${slug.replaceAll("-", "_")}`;
		const tenantURL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${dbName}`;

		await ctx.db.execute(sql`CREATE DATABASE ${sql.raw(dbName)}`);
		await ctx.db.insert(tenants).values({
			name,
			domain: slug,
			dbUri: tenantURL,
		});

		const { db, pg } = await connect(tenantURL);
		await migrate(db, { migrationsFolder: "drizzle/tenant" });
		await pg.end();
	}

	/**
	 * Remove a tenant, deleting effectively dropping the entire database
	 * @warning BE VERY CAREFUL!
	 * @param tenantName
	 * @returns
	 */
	export async function remove(ctx: LandlordContext, id: string) {
		const tenant = await ctx.db.query.tenants.findFirst({
			where: eq(tenants.id, id),
		});

		// TODO: Figure out what else to really delete. E.g: Dropping the entire DB?
		if (!tenant) return null;
		await ctx.db.transaction(async (tx) => {
			await tx.delete(tenants).where(eq(tenants.id, id));
		});

		return tenant;
	}

	export async function update(ctx: LandlordContext, tenantName: string) {
		return;
	}

	export async function fromDomain(ctx: LandlordContext, domain: URL) {
		return ctx.db.query.tenants.findFirst({
			where: eq(tenants.domain, domain.hostname),
		});
	}
}

export default Tenants;
