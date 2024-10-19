<script lang="ts" generics="T">
	import { createTable, Render, Subscribe, type TableViewModel } from "svelte-headless-table";
	import { ArrowUpDown } from "lucide-svelte/icons";
	import type { Column, HeaderCell } from "svelte-headless-table";
	import { readable } from "svelte/store";
	import * as Table from "$lib/components/ui/table";
	import DataTablePagination from "./data-table-pagination.svelte";
	import type { BaseTable } from ".";
	import { Button } from "../../button";

	interface Props {
		table: BaseTable<T>;
		columns: Column<T, BaseTable<T>["plugins"]>[];
	}

	let { table, columns }: Props = $props();
	const model = table.createViewModel(columns);
	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = model;
</script>

<div class="mt-4 w-full rounded-md border shadow-sm">
	<Table.Root {...$tableAttrs}>
		<Table.Header>
			{#each $headerRows as headerRow}
				<Subscribe rowAttrs={headerRow.attrs()}>
					<Table.Row>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
								<Table.Head {...attrs}>
									{#if cell.id === "actions"}
										<div class="text-right">
											<Render of={cell.render()} />
										</div>
									{:else if props.sort.disabled === false}
										<Button
											variant="ghost"
											class="p-0 hover:bg-inherit"
											on:click={props.sort.toggle}
										>
											<Render of={cell.render()} />
											<ArrowUpDown class={"ml-2 h-4 w-4"} />
										</Button>
									{:else}
										<Render of={cell.render()} />
									{/if}
								</Table.Head>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Header>
		<Table.Body {...$tableBodyAttrs}>
			{#each $pageRows as row (row.id)}
				<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
					<Table.Row {...rowAttrs}>
						{#each row.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs>
								<Table.Cell {...attrs}>
									<Render of={cell.render()} />
								</Table.Cell>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<DataTablePagination {model}></DataTablePagination>
