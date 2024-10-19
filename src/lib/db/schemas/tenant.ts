// ============================================================================
// W2Inc, Amsterdam 2023, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { integer, json, pgEnum, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { declareTable, joinTable } from "../utils";
import { relations, sql } from "drizzle-orm";
export * from "./shared";

// ============================================================================

export const navigationItems = declareTable("navigation_items", {
	displayName: varchar("display_name", { length: 256 }),
	groupId: uuid("group_id").references(() => navigationGroups.id),
	order: integer("order"),
	href: varchar("href", { length: 256 }).notNull(),
	permissions: text("permissions")
		.array()
		.notNull()
		.default(sql`'{}'::text[]`),
});

export const navigationGroups = declareTable("navigation_groups", {
	displayName: varchar("display_name", { length: 256 }),
});

// Format tentans:read || tenants:write
// screens:read || screens:write
export const permissions = declareTable("permissions", {
	name: varchar("name", { length: 256 }),
});

// Tables
// ============================================================================

// Create any and new tables here along with their relations

// Examples
// ============================================================================

// export const {
// 	joinTable: usersToPermissions,
// 	joinRelations: usersToPermissionsRelations
// } = joinTable(users, permissions);

// export const enumExample = pgEnum("enum_demo", ["1", "2"]);
// export type EnumType = (typeof enumExample.enumValues)[number];
