<script lang="ts">
import Form from "@/components/form.svelte";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator/index";

const { data } = $props();
</script>

<div class="mx-auto grid w-[350px] gap-6">
	<div class="grid gap-2 text-center">
		<h1 class="text-3xl font-bold">
			Login into
			<span class="capitalize">
				{#if data.type === "tenant"}
					{data.tenant?.name}
				{:else}
					Landlord
				{/if}
			</span>
		</h1>
		<p class="text-balance text-muted-foreground">
			Enter your email below to login to your account
		</p>
	</div>
	<Form method="POST" class="grid gap-4">
		<div class="grid gap-2">
			<Label for="email">Email</Label>
			<Input
				id="email"
				type="email"
				placeholder="m@example.com"
				name="email"
				title="Insert a valid email."
				required
				autocomplete="off"
			/>
		</div>
		<div class="grid gap-2">
			<div class="flex items-center">
				<Label for="password">Password</Label>
				{#if data.allowForget}
					<a href="/auth/forgot" class="ml-auto inline-block text-sm underline">
						Forgot your password?
					</a>
				{/if}
			</div>
			<Input id="password" type="password" required minlength={6} maxlength={255} name="password" />
		</div>
		{#if data.allowSignup}
			<a href="/auth/signup" class="text-sm underline"> Don't have an account yet? </a>
		{/if}
		<Separator class="my-2"></Separator>
		<Button type="submit" class="w-full">Login</Button>
	</Form>
</div>
