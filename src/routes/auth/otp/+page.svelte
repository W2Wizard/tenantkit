<script lang="ts">
import Form from "@/components/form.svelte";
import Button from "@/components/ui/button/button.svelte";
import { Card } from "@/components/ui/card/index";
import { Input } from "@/components/ui/input/index";
import { Separator } from "@/components/ui/separator/index";
import Phone from "lucide-svelte/icons/smartphone";
</script>

<Form method="post" class="max-w-sm">
	<Card class="flex flex-col justify-center gap-2 p-4">
		<div class="grid place-items-center gap-2">
			<Phone />
			<h1>Authentication code</h1>
		</div>
		<Input
			type="text"
			name="otp"
			id="otp"
			value=""
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
		<Button type="submit">Verify</Button>
		<p>
			Open your two-factor authenticator (TOTP) app or browser extension to view your authentication
			code.
		</p>
	</Card>
</Form>
