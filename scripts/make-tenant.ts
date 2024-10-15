// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================
import { $ } from "bun";
import { input } from "@inquirer/prompts";
import { connect } from "./utils";
import { tenants } from "../src/lib/db/schemas/landlord";
// ============================================================================
// Write some code as to what to what the command should do.

if (!Bun.env.DB_URL) {
	console.error("No landlord database specified in .env");
	process.exit(1);
}

const dbUrl = new URL(Bun.env.DB_URL);
const { db, sql } = await connect(Bun.env.DB_URL);

const name = await input({
	message: "Enter a name for the tenant",
	validate: async (v) => {
		if (!/^[a-zA-Z0-9-_]+$/.test(v)) {
			return "Invalid tenant name. Only alphanumeric characters, hyphens, and underscores are allowed.";
		}
		return true;
	},
});

const domain = await input({
	message: "Enter a name for the tenant",
	validate: async (v) => {
		if (!/^[a-zA-Z0-9-_]+$/.test(v)) {
			return "Invalid tenant name. Only alphanumeric characters, hyphens, and underscores are allowed.";
		}
		return true;
	},
});

dbUrl.pathname = `tenant_${name}`;
const tenants = await db
	.insert(tenants)
	.values({
		domain,
		dbUri: dbUrl.href,
	})
	.returning()
	.onConflictDoNothing();

const tenant = tenants.at(0);

console.log(tenant.at(0)!.id);
