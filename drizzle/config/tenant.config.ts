// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
	out: "./drizzle/tenant",
	schema: "./src/lib/db/schemas/tenant.ts",
	verbose: true,
	dialect: "postgresql",
	migrations: {
		table: "migrations", // default `__drizzle_migrations`,
		schema: "public", // used in PostgreSQL only and default to `drizzle`
	},
	dbCredentials: {
		url: process.env.TENANT_DB_URL ?? "None",
	},
} satisfies Config;
