<script lang="ts">
import Package2 from "lucide-svelte/icons/package-2";
import Search from "lucide-svelte/icons/search";
import Sun from "lucide-svelte/icons/sun";
import Moon from "lucide-svelte/icons/moon";
import { Button } from "$lib/components/ui/button/index.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import { toggleMode } from "mode-watcher";
import { Separator } from "@/components/ui/separator";

const { children } = $props();
</script>

{#snippet Link(href: string, text: string)}
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<a
				{href}
				class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
				use:builder.action
				{...builder}>
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
			class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
			<h1 class="relative ml-auto text-2xl">Tenants</h1>
			<Separator class="relative ml-auto flex-1 text-2xl" />
			<Button onclick={toggleMode} variant="outline" size="icon" class="rounded-lg">
				<Sun class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon
					class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				<span class="sr-only">Toggle theme</span>
			</Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						variant="outline"
						size="icon"
						class="overflow-hidden rounded-full">
						<img
							src="/avatar.png"
							width={36}
							height={36}
							alt="Avatar"
							class="overflow-hidden rounded-full" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Label>Landlord</DropdownMenu.Label>
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
