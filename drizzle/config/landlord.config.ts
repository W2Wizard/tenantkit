// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
	out: "./drizzle/landlord",
	schema: "./src/lib/db/schemas/landlord.ts",
	verbose: true,
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DB_URL ?? "None",
	},
	migrations: {
		table: "migrations", // default `__drizzle_migrations`,
		schema: "public", // used in PostgreSQL only and default to `drizzle`
	},
} satisfies Config;
