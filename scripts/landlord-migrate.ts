// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { $ } from "bun";
import { confirm } from "@inquirer/prompts";
import { connect } from "./utils";
import { tenants } from "../src/lib/db/schemas/landlord";
import { migrate } from "drizzle-orm/postgres-js/migrator";

// ============================================================================
// Write some code as to what to what the command should do.

if (!Bun.env.DB_URL) {
	console.error("No landlord database specified in .env");
	process.exit(1);
}

if (!(await confirm({ message: "Are you sure you want to apply the migration?" }))) {
	process.exit(0);
}

if (await confirm({ message: "Are you REALLY SURE!" })) {
	const { db, sql } = await connect(Bun.env.DB_URL);
	await migrate(db, { migrationsFolder: "drizzle/landlord" });
	await sql.end();
}

console.log("[Migrate] Migrations applied");
process.exit(0);
