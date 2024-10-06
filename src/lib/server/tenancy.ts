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
import { DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from "$env/static/private";
import { $ } from "bun";
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
	const sql = postgres(url, {
		max: 1,
		onnotice(notice) {
			if (notice.severity !== "NOTICE") console.warn("Warning:", notice);
		}
	});

	return { sql, db: drizzle(sql) };
}

const sqlFunc = `
-- ============================================================================
-- W2Inc, Amsterdam 2024, All Rights Reserved.
-- See README in the root project for more information.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION uuid_generate_v7() RETURNS uuid
    PARALLEL SAFE
    LANGUAGE plpgsql
AS
$$
DECLARE
  -- The current UNIX timestamp in milliseconds
  unix_time_ms CONSTANT bytea NOT NULL DEFAULT substring(int8send((extract(epoch FROM clock_timestamp()) * 1000)::bigint) FROM 3);
  -- The buffer used to create the UUID, starting with the UNIX timestamp and followed by random bytes
  buffer bytea NOT NULL DEFAULT unix_time_ms || gen_random_bytes(10);
BEGIN
  -- Set most significant 4 bits of 7th byte to 7 (for UUID v7), keeping the last 4 bits unchanged
  buffer = set_byte(buffer, 6, (b'0111' || get_byte(buffer, 6)::bit(4))::bit(8)::int);
  -- Set most significant 2 bits of 9th byte to 2 (the UUID variant specified in RFC 4122), keeping the last 6 bits unchanged
  buffer = set_byte(buffer, 8, (b'10' || get_byte(buffer, 8)::bit(6))::bit(8)::int);
  RETURN encode(buffer, 'hex')::uuid;
END
$$;

-- Code: https://github.com/Betterment/postgresql-uuid-generate-v7/blob/main/README.md

ALTER FUNCTION uuid_generate_v7() OWNER TO root;
`;

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
		await ctx.db.execute(sql`CREATE DATABASE ${sql.raw(dbName)}`);

		const tenantURL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${dbName}`
		const tenantCTX = await connect(tenantURL);

		await tenantCTX.db.execute(sql.raw(sqlFunc));
		await migrate(tenantCTX.db, { migrationsFolder: "drizzle/tenant" });
		await ctx.db.insert(tenants).values({
			domain: `${name}.localhost`,
			dbUri: tenantURL
		})
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
