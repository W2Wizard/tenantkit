// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================
import { $ } from "bun";
import { input } from "@inquirer/prompts";
import { connect } from "./utils";
import { SQLFunctions } from "./utils/seed";

// ============================================================================
if (!Bun.env.DB_URL) {
	console.error("No landlord database specified in .env");
	process.exit(1);
}

console.log("[Seeding] Seeding landlord database...");
const con = await connect(Bun.env.DB_URL);
await Promise.all([SQLFunctions(con)]);
console.log("[Seeding] Complete");
await con.sql.end();
process.exit(0);
