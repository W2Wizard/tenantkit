<script>
import Form from "@/components/form.svelte";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator/index";
</script>

<div class="mx-auto grid w-[350px] gap-6">
	<div class="grid gap-2 text-center">
		<h1 class="text-3xl font-bold">Login</h1>
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
			/>
		</div>
		<div class="grid gap-2">
			<Label for="password">Password</Label>
			<Input id="password" type="password" required minlength={6} maxlength={255} name="password" />
		</div>

		<div class="grid gap-2">
			<Label for="password">Confirm Password</Label>
			<Input
				id="c-password"
				type="password"
				required
				minlength={6}
				maxlength={255}
				name="c-password"
			/>
		</div>

		<a href="/auth/signin" class="text-sm underline"> Already have an account? </a>
		<Separator class="my-2"></Separator>
		<Button type="submit" class="w-full">Login</Button>
	</Form>
</div>
