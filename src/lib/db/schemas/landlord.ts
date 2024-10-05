// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { text } from "drizzle-orm/pg-core";
import { declareTable, joinTable, jwtEncoded } from "../utils";
export * from "./shared";

// Tables
// ============================================================================

export const tenants = declareTable("tenants", {
	domain: text("domain").notNull().unique(),
	dbUri: jwtEncoded("db_uri").notNull()
});

export type TenantsType = typeof tenants.$inferSelect;
