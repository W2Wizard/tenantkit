// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { join } from "node:path";
import { readdir } from "node:fs/promises";
import { tenants } from "../../src/lib/db/schemas/landlord";
import { type Connection } from ".";

// SQL Scripts
// ============================================================================

/** Insert all the sql procedures into the database. */
export async function SQLFunctions(con: Connection) {
	console.log("Seeding SQL Functions...");

	const dir = join(import.meta.dirname, "..", "functions");
	const files = await readdir(dir);
	const scripts = await Promise.all(
		files
			.filter((file) => file.endsWith(".sql"))
			.map(async (file) => {
				return Bun.file(join(dir, file));
			})
	);

	// // Save the SQL scripts to the database or use them as needed
	for (const script of scripts) {
		const code = await script.text();
		await con.db.execute(sql.raw(code));
	}
}
