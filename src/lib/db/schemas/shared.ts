// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { pgTable, text, varchar, serial, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

/**
 * Some schema data is the same across databases such as accounts and sessions.
 * This makes selecting and working with different contexts much more convenient.
 *
 * In order for it to be shared both landlord and tenant schemas must re-export
 * their tables.
 */

// ============================================================================

// Sessions for authentication
export const sessions = pgTable("sessions", {
	id: varchar("id", { length: 255 }).primaryKey(),
	userId: text("user_id").notNull(),
	expiresAt: timestamp("expires_at").notNull()
});

// Reset tokens for password resets
export const resetTokens = pgTable("reset_tokens", {
	id: text("id").primaryKey(),
	userId: uuid("user_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull()
});

export type ResetTokens = typeof resetTokens.$inferSelect;

// Verification tokens
export const verificationTokens = pgTable("verification_tokens", {
	id: serial("id").primaryKey().notNull(),
	code: text("code").notNull(),
	email: text("email").notNull(),
	userId: uuid("user_id").unique().notNull(),
	expiresAt: timestamp("expires_at").notNull()
});

// ============================================================================

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	email: text("email").notNull(),
	verified: boolean("verified").default(false),
	hash: text("hash"),
	tfa: text("tfa")
});

export type UsersType = typeof users.$inferSelect;
