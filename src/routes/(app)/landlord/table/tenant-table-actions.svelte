<script lang="ts">
import { Ellipsis, Pen, Trash2, Filter, Banknote } from "lucide-svelte/icons";
import { Button } from "$lib/components/ui/button";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button
			variant="ghost"
			builders={[builder]}
			class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
		>
			<Ellipsis class="h-4 w-4" />
			<span class="sr-only">Open Menu</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-[180px]" align="end">
		<DropdownMenu.Item on:click={() => console.log("123")}>
			Edit
			<DropdownMenu.Shortcut>
				<Pen class="size-4" />
			</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => console.log("123")}>
			Screen Selection
			<DropdownMenu.Shortcut>
				<Filter class="size-4" />
			</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => console.log("123")}>
			Edit CPM or Price
			<DropdownMenu.Shortcut>
				<Banknote class="size-4" />
			</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>
			Delete
			<DropdownMenu.Shortcut>
				<Trash2 class="h-4 w-4" />
			</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
