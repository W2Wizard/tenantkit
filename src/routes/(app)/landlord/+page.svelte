<script lang="ts">
import File from "lucide-svelte/icons/file";
import Home from "lucide-svelte/icons/house";
import LineChart from "lucide-svelte/icons/chart-bar";
import ListFilter from "lucide-svelte/icons/list-filter";
import Ellipsis from "lucide-svelte/icons/ellipsis";
import Package from "lucide-svelte/icons/package";
import Package2 from "lucide-svelte/icons/package-2";
import PanelLeft from "lucide-svelte/icons/panel-left";
import CirclePlus from "lucide-svelte/icons/circle-plus";
import Search from "lucide-svelte/icons/search";
import Settings from "lucide-svelte/icons/settings";
import ShoppingCart from "lucide-svelte/icons/shopping-cart";
import UsersRound from "lucide-svelte/icons/users-round";

import { Badge } from "$lib/components/ui/badge/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import * as Sheet from "$lib/components/ui/sheet/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Tabs from "$lib/components/ui/tabs/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import { type Icon } from "lucide-svelte";
import { type TenantsType } from "@/db/schemas/landlord";
import { tenant, tenants } from "./state.svelte";
import TenantTable from "./table/tenant-table.svelte";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaginationState } from "svelte-headless-table/plugins";
import { Label } from "@/components/ui/label";
import * as Popover from "@/components/ui/popover";
import Form from "@/components/form.svelte";
import Separator from "@/components/ui/separator/separator.svelte";

const { data } = $props();

let pageState: PaginationState;

const loadTenants = async () => ($tenants = await Promise.resolve(data.tenants));
</script>

<div class="flex items-center">
	<div class=" flex items-center gap-2">
		<Popover.Root>
			<Popover.Trigger asChild let:builder>
			 <Button builders={[builder]} size="sm" class="h-7 gap-1">
				<CirclePlus class="h-3.5 w-3.5" />
				<span class="sr-only sm:not-sr-only sm:whitespace-nowrap">
					Add Tenant
				</span>
			</Button>
			</Popover.Trigger>
			<Popover.Content class="w-80">
				<Form class="grid gap-4">
					<div class="space-y-2">
				 		<h4 class="font-medium leading-none">Tenant</h4>
				 		<p class="text-muted-foreground text-sm">
							Create a new tenant, upon saving a new database will created and the tenant is available.
				 		</p>
						</div>
						 <div class="grid grid-cols-3 items-center gap-4">
								<Label for="width">Name</Label>
								<Input id="width" name="name" placeholder="New Tenant" class="col-span-2 h-8" />
						 </div>
						<Separator class="my-2" />
					<Button type="submit">Save changes</Button>
				</Form>
			</Popover.Content>
		 </Popover.Root>
		<Button size="sm" variant="outline" class="h-7 gap-1">
			<File class="h-3.5 w-3.5" />
			<span class="sr-only sm:not-sr-only sm:whitespace-nowrap"> Export </span>
		</Button>
	</div>
</div>
<Card.Root>
	<Card.Header>
		<Card.Title>Tenants</Card.Title>
		<Card.Description>Manage your tenants or add new ones</Card.Description>
	</Card.Header>
	<Card.Content>
		{#await loadTenants()}
			<div class="flex items-center space-x-4">
				<Skeleton class="h-12 w-12 rounded-full" />
				<div class="space-y-2">
					<Skeleton class="h-4 w-[250px]" />
					<Skeleton class="h-4 w-[200px]" />
				</div>
			</div>
		{:then _}
			<TenantTable></TenantTable>
		{:catch error}
			<p>Something went wrong: {error.message}</p>
		{/await}
	</Card.Content>
</Card.Root>

<Sheet.Root open={$tenant !== null} onOpenChange={(v) =>  $tenant  = v ? $tenant : null}>
  <Sheet.Content side="left">
    <Sheet.Header>
      <Sheet.Title>Edit profile</Sheet.Title>
      <Sheet.Description>
        Make changes to your profile here. Click save when you're done.
      </Sheet.Description>
    </Sheet.Header>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="name" class="text-right">Name</Label>
        <Input id="name" value={$tenant!.id} class="col-span-3" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="username" class="text-right">Username</Label>
        <Input id="username" value="@peduarte" class="col-span-3" />
      </div>
    </div>
    <Sheet.Footer>
      <Sheet.Close asChild let:builder>
        <Button builders={[builder]} type="submit">Save changes</Button>
      </Sheet.Close>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
