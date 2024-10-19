import { getTableName, relations, sql } from "drizzle-orm";
import {
	customType,
	pgEnum,
	PgTable,
	pgTable,
	primaryKey,
	timestamp,
	uuid,
	type PgColumnBuilderBase,
} from "drizzle-orm/pg-core";
import jwt from "jsonwebtoken";

// ============================================================================

/**
 * Wrapper function to declare a base table for the database. Always comes with a uuid as primary key
 * and a created_at and updated_at field.
 * @param name The name of the table.
 * @param columns Any other additional columns to be defined.
 * @returns A new PGTable
 */
export const declareTable = <
	TTableName extends string,
	TColumnsMap extends Record<string, PgColumnBuilderBase>,
>(
	name: TTableName,
	columns: TColumnsMap
) => {
	return pgTable(name, {
		id: uuid("id")
			.default(sql`uuid_generate_v7()`)
			.primaryKey(),
		createdAt: timestamp("created_at", { mode: "date", precision: 3 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
		...columns,
	});
};

// TODO: It declares it as any ?
/** The base return type for the PG base table. */
type PGBaseTable = ReturnType<typeof declareTable>;

/**
 * Wrapper function to declare a many-to-many relationship between two tables.
 * @param firstTable The first table to join.
 * @param secondTable The second table to join.
 * @returns A new table to be exported alongside with the relation that is being established.
 */
export function joinTable<T1 extends PgTable, T2 extends PgTable>(firstTable: T1, secondTable: T2) {
	const nameA = getTableName(firstTable);
	const nameB = getTableName(secondTable);
	const keyA = `${nameA}Id`;
	const keyB = `${nameB}Id`;

	/** The literal join table itself. */
	const joinTable = pgTable(
		`${nameA}To${nameB}`,
		{
			[keyA]: uuid(`${nameA}_id`)
				.notNull()
				.references(() => firstTable.id),
			[keyB]: uuid(`${nameB}_id`)
				.notNull()
				.references(() => secondTable.id),
		},
		(t) => ({
			pk: primaryKey({ columns: [t[keyA], t[keyB]] }),
		})
	);

	/** The relations established for the join table */
	const joinRelations = relations(joinTable, ({ one }) => ({
		tableA: one(firstTable, {
			fields: [joinTable[keyA]],
			references: [firstTable.id],
		}),
		tableB: one(secondTable, {
			fields: [joinTable[keyB]],
			references: [secondTable.id],
		}),
	}));

	return { table: joinTable, relations: joinRelations };
}

// ============================================================================

/**
 * Special column to sign and verify a column value.
 * Useful for things like sensitive URI's.
 *
 * IMPORTANT: We must not import this file besides for types!
 */
export const jwtEncoded = customType<{ data: string }>({
	dataType() {
		return "text";
	},
	fromDriver(value: unknown) {
		return jwt.verify(value as string, process.env.APP_SECRET ?? "").toString();
	},
	toDriver(value: string) {
		return jwt.sign(value, process.env.APP_SECRET ?? "");
	},
});
