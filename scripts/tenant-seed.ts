// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { connect } from "./utils";
import { tenants } from "../src/lib/db/schemas/landlord";
import { SQLFunctions } from "./utils/seed";

// ============================================================================

if (!Bun.env.DB_URL) {
	console.error("No landlord database specified in .env");
	process.exit(1);
}

console.log("[Seeding] Seeding tenant databases...");
const con = await connect(Bun.env.DB_URL);
const tenantsList = await con.db.select().from(tenants);
console.log("\nListing tenants:");
for (const tenant of tenantsList) {
	console.log(`[Seeding]:`, tenant.id, "@", tenant.domain);
	await Promise.all([SQLFunctions(con)]);
}

console.log();
await con.sql.end();
process.exit(0);
