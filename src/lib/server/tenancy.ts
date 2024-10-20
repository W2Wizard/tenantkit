// ============================================================================
// W2Inc, Amstelveen 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { slugify } from "@/utils";
import { and, eq, not, sql } from "drizzle-orm";
import { tenants, type TenantsUpdate } from "@/db/schemas/landlord";
import type { UsersType } from "@/db/schemas/shared";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { DB_HOST, DB_PASSWORD, DB_PORT, DB_URL, DB_USER } from "$env/static/private";
import * as tenantSchema from "@/db/schemas/tenant";

// Types
// ============================================================================

/**
 * Commonly shared user type between tenant and landlord.
 * This is mainly used to ensure that fetching a user commonly like for example
 * logging in is made easier.
 */
export type User = UsersType;

export async function connect(url: string) {
	return drizzle({
		connection: { url, max: 1 },
		schema: tenantSchema,
	}) as TenantDB;
}

// ============================================================================

/** Overall tenancy functionality, mainly CRUD actions */
namespace Tenants {
	/**
	 * Function to find a tenant by a specific domain.
	 * @param ctx The landlord context.
	 * @param domain The domain to search for.
	 * @returns The tenant if found, otherwise null.
	 */
	export async function findByDomain(ctx: LandlordContext, domain: string) {
		return await ctx.db.query.tenants.findFirst({
			where: eq(tenants.domain, domain),
		});
	}

	/**
	 * Function to declare a new tenant and setup the database.
	 * @param tenantName The new tenant name.
	 * @returns
	 */
	export async function create(ctx: LandlordContext, name: string) {
		const slug = slugify(name);
		const dbName = `tenant_${slug.replaceAll("-", "_")}`;
		const tenantURL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${dbName}`;
		if (await Tenants.findByDomain(ctx, slug)) {
			throw Error("Tenant by such domain is already taken");
		}

		await ctx.db.execute(sql`CREATE DATABASE ${sql.raw(dbName)}`);
		await ctx.db.insert(tenants).values({
			name,
			domain: slug,
			dbUri: tenantURL,
		});

		const db = await connect(tenantURL);
		await migrate(db, { migrationsFolder: "drizzle/tenant" });
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

	/**
	 * Update a tenant
	 * @param ctx
	 * @param id
	 * @param d
	 * @returns
	 */
	export async function update(ctx: LandlordContext, id: string, d: TenantsUpdate) {
		if (
			d.domain &&
			(await ctx.db.query.tenants.findFirst({
				where: and(not(eq(tenants.id, id)), eq(tenants.domain, d.domain)),
			}))
		) {
			throw Error("Domain is already taken");
		}

		return await ctx.db.update(tenants).set(d).where(eq(tenants.id, id)).returning();
	}

	/**
	 * Resolve a tenant by finding them via url
	 * @param ctx The Landlord context
	 * @param domain The domain to search with.
	 * @returns The tenant or undefined.
	 */
	export async function fromDomain(ctx: LandlordContext, domain: URL) {
		console.log(domain)

		return ctx.db.query.tenants.findFirst({
			where: eq(tenants.domain, domain.hostname.split('.')[0]),
		});
	}
}

export default Tenants;
