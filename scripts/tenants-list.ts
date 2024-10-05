// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { connect } from "./utils";
import { tenants } from "../src/lib/db/schemas/landlord";

// ============================================================================
// Write some code as to what to what the command should do.

if (!Bun.env.DB_URL) {
	console.error("No landlord database specified in .env");
	process.exit(1);
}

const { db, sql } = await connect(Bun.env.DB_URL);
const tenantsList = await db.select().from(tenants);
console.log("\nListing tenants:");
for (const tenant of tenantsList) {
	console.log(`[Tenant] id: ${tenant.id} @ ${tenant.domain}`);
}

console.log();
await sql.end();
process.exit(0);
