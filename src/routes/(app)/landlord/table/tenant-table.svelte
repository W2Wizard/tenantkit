<script lang="ts">
import { defineTable } from "@/components/ui/table/data";
import DataTableActions from "./tenant-table-actions.svelte";
import DataTable from "@/components/ui/table/data/data-table.svelte";
import { createRender } from "svelte-headless-table";
import { tenants } from "../state.svelte";

const table = defineTable(tenants);
const columns = table.createColumns([
	table.column({
		header: "Id",
		accessor: ({ id }) => id,
		cell: ({ value }) => value,
	}),
	table.column({
		accessor: "name",
		header: "Name",
		cell: ({ value }) => value,
		plugins: {
			sort: {
				disable: true,
			},
		},
	}),
	table.column({
		accessor: "domain",
		header: "Sub-Domain",
		cell: ({ value }) => value,
		plugins: {
			sort: {
				disable: true,
			},
		},
	}),
	table.column({
		accessor: "createdAt",
		header: "Created At",
		cell: ({ value }) =>
			value.toLocaleDateString("en-US", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			}),
		plugins: {
			sort: {
				disable: false,
			},
		},
	}),
	table.column({
		accessor: "updatedAt",
		header: "Updated At",
		cell: ({ value }) =>
			value.toLocaleDateString("en-US", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			}),
		plugins: {
			sort: {
				disable: false,
			},
		},
	}),
	table.column({
		accessor: (item) => item,
		header: "",
		//@ts-ignore Wait for svelte 5 release
		cell: ({ value }) =>
			createRender(DataTableActions, {
				selected: value,
			}),
		plugins: {
			sort: {
				disable: true,
			},
		},
	}),
]);
</script>

<DataTable {table} {columns}></DataTable>
