// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { join } from "node:path";
import { readdir } from "node:fs/promises";
import { tenants } from "./schemas/landlord";

const client = postgres(Bun.argv[2] ?? Bun.env.DB_URL, {
	max: 128,
	onnotice: (notice) => console.log("NOTE:", notice.message)
});
const db = drizzle(client);

// SQL Scripts
// ============================================================================

/** Insert all the sql procedures into the database. */
async function SQLFunctions() {
	console.log("Seeding SQL Functions...");

	const dir = join(import.meta.dirname, "functions");
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
		await db.execute(sql.raw(code));
	}
}

// ============================================================================

/** Seed the database with all the seed functions */
export async function seed() {
	console.log("Seeding...");

	// await db.insert(tenants).values({
	// 	domain: "test.localhost",
	// 	dbUri: "postgresql://demo:demo@127.0.0.1:5432/tenant_demo"
	// });

	await Promise.all([SQLFunctions()]);

	await client.end();
	console.log("Finished!");
}

await seed();
