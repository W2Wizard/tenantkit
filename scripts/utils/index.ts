// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

/**
 * Utility function to append a script function under a given name.
 * @param name The name of the command.
 * @param command The command that invokes the script.
 * @returns True if it managed else false;
 */
export async function addScriptToPackage(name: string, command: string) {
	const jsonFile = "./package.json";
	const index = Bun.file(jsonFile);
	if (!(await index.exists())) {
		console.error("Package.json file does not exist.");
		return false;
	}

	const packageJson = await index.json();
	packageJson.scripts = packageJson.scripts || {};
	if (packageJson.scripts[name]) {
		console.error(`Command: '${name}' is already taken.`);
		return false;
	}

	// Make it top most for easier insertion, don't have to deal with (,)
	packageJson.scripts = { [name]: command, ...packageJson.scripts };
	await Bun.write(jsonFile, JSON.stringify(packageJson, null, 2));
	return true;
}

export type Connection = {
	sql: postgres.Sql<{}>;
	db: PostgresJsDatabase;
};

/**
 * Return the drizzle instance on a DB.
 * @param url The postgres URL
 */
export async function connect(url: string): Promise<Connection> {
	const sql = postgres(url, {
		max: 1,
		onnotice(notice) {
			if (notice.severity !== "NOTICE") console.warn("Warning:", notice);
		},
	});

	return { sql, db: drizzle(sql) };
}
