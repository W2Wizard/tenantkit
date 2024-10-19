<script lang="ts">
import { Ellipsis, Pen, Trash2, Filter, Banknote } from "lucide-svelte/icons";
import { Button } from "$lib/components/ui/button";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import type { TenantsType } from "@/db/schemas/landlord";
import { tenant } from "../state.svelte";
import Form from "@/components/form.svelte";
import { invalidate } from "$app/navigation";
import { dialog } from "@/components/dialog/state.svelte";

// Props
// ====================================================

interface Props {
	selected: TenantsType;
}
const { selected }: Props = $props();

// Functions
// ====================================================

async function beforeSubmit() {
	return await dialog.confirm();
}

function onResult() {
	invalidate("landlord:tenants");
}
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
		<Form method="POST" {beforeSubmit} {onResult}>
			<input hidden readonly name="id" value={selected.id} />
			<DropdownMenu.Item on:click={() => ($tenant = selected)}>
				Edit
				<DropdownMenu.Shortcut>
					<Pen class="size-4" />
				</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item>
				<button formaction="?/delete" class="p-0 bg-none w-full text-left"> Delete </button>
				<DropdownMenu.Shortcut>
					<Trash2 class="h-4 w-4" />
				</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		</Form>
	</DropdownMenu.Content>
</DropdownMenu.Root>
