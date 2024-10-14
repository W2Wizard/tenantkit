<script lang="ts">
import Form from "@/components/form.svelte";
import { ShieldCheck } from "lucide-svelte/icons";
import { Button } from "@/components/ui/button/index";
import { Card } from "@/components/ui/card/index";
import { Checkbox } from "@/components/ui/checkbox/index";
import { Input } from "@/components/ui/input/index";
import { Separator } from "@/components/ui/separator/index";
import { Alert } from "@/components/ui/alert/index";

const { data } = $props();
let value = $state<string>("");
let checked = $state<boolean | "indeterminate" | undefined>(false);
let disabled = $derived<boolean>(value.length === 0);
</script>

<Form method="post" class="max-w-sm">
	<Card class="flex flex-col gap-2 p-4">
		{#if checked}
			<p class="break-words break-all rounded-lg bg-[hsl(var(--muted))] p-4">
				{data.secret}
			</p>
		{:else}
			{@html data.qr}
		{/if}
		<div class="flex items-center space-x-2">
			<Checkbox id="terms" bind:checked />
			<label
				for="terms2"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 peer-data-[disabled=true]:cursor-not-allowed peer-data-[disabled=true]:opacity-70"
			>
				View URI instead
			</label>
		</div>
		<p>
			Open your two-factor authenticator (TOTP) app or browser extension to scan your authentication
			code.
		</p>

		<Input
			bind:value
			type="text"
			name="otp"
			id="otp"
			minlength={6}
			maxlength={6}
			aria-labelledby="session-otp-input-label"
			aria-describedby="session-otp-input-description"
			autocomplete="off"
			autofocus={true}
			inputmode="numeric"
			placeholder="XXXXXX"
		/>
		<Separator />
		<Button type="submit" {disabled} aria-disabled={disabled}>Next</Button>
	</Card>

	<Alert title="2FA is mandatory!" class="bg-card text-card-foreground">
		<ShieldCheck class="h-5 w-5" />
		Two-factor authentication is mandatory. You must set it up to continue.
	</Alert>
</Form>
