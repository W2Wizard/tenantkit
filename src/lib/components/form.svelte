<script lang="ts">
import { toast } from "svelte-sonner";
import { applyAction, enhance } from "$app/forms";
import type { ActionResult, SubmitFunction } from "@sveltejs/kit";
import type { HTMLFormAttributes } from "svelte/elements";

interface Props extends HTMLFormAttributes {
	isLoading?: boolean;
	onLoading?: (isLoading: boolean) => void;
	onResult?: (result: ActionResult) => void;
}

let { isLoading, onLoading, onResult, children, ...rest }: Props = $props();

export const onSubmit: SubmitFunction = () => {
	onLoading?.((isLoading = true));
	toast.loading("Loading...");

	return async ({ result }) => {
		onLoading?.((isLoading = false));
		onResult?.(result);

		toast.dismiss();
		if (result.type === "success" && result.data) {
			toast.success(result.data["message"] || "Success!");
		} else if (result.type === "failure" && result.data) {
			toast.error(result.data["message"] || "An error occurred.");
		}

		await applyAction(result);
	};
};
</script>

<form method="post" enctype="multipart/form-data" {...rest} use:enhance={onSubmit}>
	{#if children}
		{@render children()}
	{/if}
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>
