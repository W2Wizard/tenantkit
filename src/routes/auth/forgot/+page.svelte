<script>
import Form from "@/components/form.svelte";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

let { data } = $props();
</script>

{#snippet resetPassword()}
	<div class="grid gap-2">
		<Label for="new-password">New Password</Label>
		<Input id="new-password" type="password" name="new-password" required />
	</div>
	<!-- <div class="grid gap-2">
		<Label for="new-password2">Confirm Password</Label>
		<Input id="new-password2" type="password" name="new-password2" required />
	</div> -->
	<hr />
	<Button type="submit" formaction="/auth/forgot?/reset" class="mt-2 w-full">Send request</Button>
{/snippet}

{#snippet sendRequest()}
	<div class="grid gap-2">
		<Label for="email">Email</Label>
		<Input
			id="email"
			type="email"
			placeholder="m@example.com"
			title="Insert a valid email."
			name="email"
			required
		/>
	</div>
	<Button type="submit" formaction="/auth/forgot?/request" class="mt-2 w-full">Send request</Button>
{/snippet}

<div class="mx-auto grid w-[350px] gap-6">
	<div class="grid gap-2 text-center">
		<h1 class="text-3xl font-bold">Forgot Password</h1>
		<p class="text-balance text-muted-foreground">
			{#if data.token}
				Enter your new password and confirm it. Make sure it's at least 6 characters long and please
				remember it this time.
			{:else}
				Please enter your email address to reset your password. We'll send you a link to reset it.
			{/if}
		</p>
	</div>
	<Form class="grid gap-4">
		{#if data.token}
			<input type="hidden" name="token" value={data.token} />
			{@render resetPassword()}
		{:else}
			{@render sendRequest()}
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t"></span>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-background px-2 text-muted-foreground">Or</span>
				</div>
			</div>
			<Button variant="outline" class="w-full" href="/auth/signin">Back to login</Button>
		{/if}
	</Form>
</div>
