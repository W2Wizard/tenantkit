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
	import { tenants } from "./state.svelte";
	import TenantTable from "./table/tenant-table.svelte";
	import { Skeleton } from "@/components/ui/skeleton";
	import type { PaginationState } from "svelte-headless-table/plugins";

	const { children } = $props();

	</script>

{#snippet Link(href: string, text: string)}
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<a
				{href}
				class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
				use:builder.action
				{...builder}
			>
				<Package2 class="h-4 w-4 transition-all group-hover:scale-110" />
				<span class="sr-only">{text}</span>
			</a>
		</Tooltip.Trigger>
		<Tooltip.Content side="right">{text}</Tooltip.Content>
	</Tooltip.Root>
{/snippet}


<div class="flex min-h-screen w-full flex-col bg-muted/20">
	<aside class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
		<nav class="flex flex-col items-center gap-4 px-2 py-4">
			{@render Link("##", "Dashboard")}
		</nav>
	</aside>
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
		<header
			class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
		>
			<div class="relative ml-auto flex-1">
				<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input type="search" placeholder="Search..." class="w-full rounded-lg bg-background pl-8" />
			</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						variant="outline"
						size="icon"
						class="overflow-hidden rounded-full"
					>
						<img
							src="/avatar.png"
							width={36}
							height={36}
							alt="Avatar"
							class="overflow-hidden rounded-full"
						/>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Label>My Account</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<form action="/auth/logout" method="post">
						<DropdownMenu.Item inset class="p-0">
							<Button type="submit" variant="destructive" class="h-8 w-[100%]">Logout</Button>
						</DropdownMenu.Item>
					</form>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</header>
		<main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
			{@render children()}
		</main>
	</div>
</div>
