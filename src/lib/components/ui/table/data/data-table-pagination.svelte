<script lang="ts" generics="T">
import type { TableViewModel } from "svelte-headless-table";
import * as Select from "@/components/ui/select";
import { ChevronRight, ChevronLeft, ArrowRight, ArrowLeft } from "lucide-svelte";
import { Button } from "@/components/ui/button";
import type { defineTable } from ".";

interface Props {
	model: TableViewModel<T, ReturnType<typeof defineTable<T>>["plugins"]>;
}

const { model }: Props = $props();
const { pageRows, pluginStates, rows } = model;
const { hasNextPage, hasPreviousPage, pageIndex, pageCount, pageSize } = pluginStates.page;
</script>

<div class="flex items-center justify-between py-2">
	<div class="flex-1 text-sm text-muted-foreground">
		<!-- {Object.keys(selectedDataIds).length} of {$rows.length} row(s) selected. -->
	</div>
	<div class="flex items-center space-x-6 lg:space-x-8">
		<div class="flex items-center space-x-2">
			<p class="text-sm font-medium">Rows per page</p>
			<Select.Root
				onSelectedChange={(selected) => pageSize.set(Number(selected?.value))}
				selected={{ value: 10, label: "10" }}
			>
				<Select.Trigger class="h-8 w-[70px]">
					<Select.Value placeholder="Select page size" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="10">10</Select.Item>
					<Select.Item value="20">20</Select.Item>
					<Select.Item value="30">30</Select.Item>
					<Select.Item value="40">40</Select.Item>
					<Select.Item value="50">50</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex w-[100px] items-center justify-center text-sm font-medium">
			Page {$pageIndex + 1} of {$pageCount}
		</div>
		<div class="flex items-center space-x-2">
			<Button
				variant="outline"
				class="hidden size-8 p-0 lg:flex"
				on:click={() => ($pageIndex = 0)}
				disabled={!$hasPreviousPage}
			>
				<span class="sr-only">Go to first page</span>
				<ArrowLeft size={15} />
			</Button>
			<Button
				variant="outline"
				class="size-8 p-0"
				on:click={() => ($pageIndex = $pageIndex - 1)}
				disabled={!$hasPreviousPage}
			>
				<span class="sr-only">Go to previous page</span>
				<ChevronLeft size={15} />
			</Button>
			<Button
				variant="outline"
				class="size-8 p-0"
				disabled={!$hasNextPage}
				on:click={() => ($pageIndex = $pageIndex + 1)}
			>
				<span class="sr-only">Go to next page</span>
				<ChevronRight size={15} />
			</Button>
			<Button
				variant="outline"
				class="hidden size-8 p-0 lg:flex"
				disabled={!$hasNextPage}
				on:click={() => ($pageIndex = Math.ceil($rows.length / $pageRows.length) - 1)}
			>
				<span class="sr-only">Go to last page</span>
				<ArrowRight size={15} />
			</Button>
		</div>
	</div>
</div>
