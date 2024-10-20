<script>
import CircleUser from "lucide-svelte/icons/circle-user";
import LineChart from "lucide-svelte/icons/linkedin";
import Package from "lucide-svelte/icons/package";
import Home from "lucide-svelte/icons/house";
import ShoppingCart from "lucide-svelte/icons/shopping-cart";
import Sun from "lucide-svelte/icons/sun";
import Moon from "lucide-svelte/icons/moon";
import Menu from "lucide-svelte/icons/menu";
import Package2 from "lucide-svelte/icons/package-2";
import Search from "lucide-svelte/icons/search";
import Users from "lucide-svelte/icons/users";

import { Badge } from "$lib/components/ui/badge/index";
import { Button } from "$lib/components/ui/button/index";
import * as Card from "$lib/components/ui/card/index";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index";
import { Input } from "$lib/components/ui/input/index";
import * as Sheet from "$lib/components/ui/sheet/index";
import { toggleMode } from "mode-watcher";
import Form from "@/components/form.svelte";

const { children } = $props();

const navItems = [
	{ href: "##", icon: Home, label: "Dashboard" },
	{ href: "##", icon: ShoppingCart, label: "Orders", badge: 6 },
	{ href: "##", icon: Package, label: "Products", active: true },
	{ href: "##", icon: Users, label: "Customers" },
	{ href: "##", icon: LineChart, label: "Analytics" },
];
</script>

<div class="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
	<nav id="side-panel" class="hidden border-r bg-muted/40 md:block">
		<div class="flex h-full max-h-screen flex-col gap-2">
			<div
				id="top-banner"
				class="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6"
			>
				<a href="/" class="flex items-center gap-2 font-semibold">
					<Package2 class="h-6 w-6" />
					<span class="">W2Inc</span>
				</a>
				<Button onclick={toggleMode} variant="outline" size="icon">
					<Sun class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon
						class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>
			<div id="navigation" class="flex-1">
				<nav class="grid items-start px-2 text-sm font-medium lg:px-4">
					{#each navItems as { href, icon: Icon, label, badge, active }}
						<a
							{href}
							class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary {active
								? 'bg-muted text-primary'
								: ''}"
						>
							<Icon class="h-4 w-4" />
							{label}
							{#if badge}
								<Badge
									class="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
								>
									{badge}
								</Badge>
							{/if}
						</a>
					{/each}
				</nav>
			</div>
			<div id="bottom-banner" class="mt-auto p-4">
				<Card.Root>
					<Card.Header class="p-2 pt-0 md:p-4">
						<Card.Title>Upgrade to Pro</Card.Title>
						<Card.Description>
							Unlock all features and get unlimited access to our support team.
						</Card.Description>
					</Card.Header>
					<Card.Content class="p-2 pt-0 md:p-4 md:pt-0">
						<Button size="sm" class="w-full">Upgrade</Button>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</nav>

	<div class="grid grid-rows-[auto,1fr]">
		<header class="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
			<Sheet.Root>
				<Sheet.Trigger asChild let:builder>
					<Button variant="outline" size="icon" class="shrink-0 md:hidden" builders={[builder]}>
						<Menu class="h-5 w-5" />
						<span class="sr-only">Toggle navigation menu</span>
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="left" class="flex flex-col">
					<nav class="grid gap-2 text-lg font-medium">
						<a href="##" class="flex items-center gap-2 text-lg font-semibold">
							<Package2 class="h-6 w-6" />
							<span class="sr-only">Acme Inc</span>
						</a>
						{#each navItems as { href, icon: Icon, label, badge, active }}
							<a
								{href}
								class="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground {active
									? 'bg-muted text-foreground'
									: ''}"
							>
								<Icon class="h-5 w-5" />
								{label}
								{#if badge}
									<Badge
										class="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
									>
										{badge}
									</Badge>
								{/if}
							</a>
						{/each}
					</nav>
					<div class="mt-auto">
						<Card.Root>
							<Card.Header>
								<Card.Title>Upgrade to Pro</Card.Title>
								<Card.Description>
									Unlock all features and get unlimited access to our support team.
								</Card.Description>
							</Card.Header>
							<Card.Content>
								<Button size="sm" class="w-full">Upgrade</Button>
							</Card.Content>
						</Card.Root>
					</div>
				</Sheet.Content>
			</Sheet.Root>
			<div class="w-full flex-1">
				<form>
					<div class="relative">
						<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search products..."
							class="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
						/>
					</div>
				</form>
			</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button builders={[builder]} variant="secondary" size="icon" class="rounded-full">
						<CircleUser class="h-5 w-5" />
						<span class="sr-only">Toggle user menu</span>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Label>My Account</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item href="/settings/account">Settings</DropdownMenu.Item>
					<DropdownMenu.Item>Support</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<Form action="/auth/logout" method="post">
						<DropdownMenu.Item inset class="p-0">
							<Button type="submit" variant="destructive" class="h-8 w-[100%]">Logout</Button>
						</DropdownMenu.Item>
					</Form>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</header>
		<main class="flex flex-1 flex-col gap-4 lg:gap-6">
			{@render children()}
		</main>
	</div>
</div>
