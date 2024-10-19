// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { text, varchar } from "drizzle-orm/pg-core";
import { declareTable, joinTable, jwtEncoded } from "../utils";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { InferUpdateModel } from "./shared";
export * from "./shared";

// Tables
// ============================================================================

export const tenants = declareTable("tenants", {
	name: varchar("name", { length: 256 }).notNull(),
	domain: text("domain").notNull().unique(),
	dbUri: jwtEncoded("db_uri").notNull(),
});

export type TenantsType = InferSelectModel<typeof tenants>;
export type TenantsUpdate = InferUpdateModel<typeof tenants>;
