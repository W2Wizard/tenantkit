// ============================================================================
// W2Inc, Amsterdam 2023, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { createTable, type ReadOrWritable } from "svelte-headless-table";
import { addPagination, addSortBy, addTableFilter } from "svelte-headless-table/plugins";

// ============================================================================

/**
 * Define a new data table which comes with some default plugins enabled.
 * @param data The Data itself.
 * @template T The type of the Data.
 * @returns
 */
export function defineTable<T>(data: ReadOrWritable<T[]>) {
	return createTable(data, {
		page: addPagination(),
		sort: addSortBy(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase()),
		}),
	});
}

/** The type of a common data table where T is the data type. */
export type BaseTable<T> = ReturnType<typeof defineTable<T>>;
