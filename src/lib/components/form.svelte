<script lang="ts">
import { toast } from "svelte-sonner";
import { applyAction, enhance } from "$app/forms";
import type { ActionResult, SubmitFunction } from "@sveltejs/kit";
import type { HTMLFormAttributes } from "svelte/elements";

interface Props extends HTMLFormAttributes {
	isLoading?: boolean;
	/**
	 * Function to handle submit cancellations.
	 * If for instance you want to confirm a submission.
	 * If false no submit fetch is sent, else it will be submitted.
	 */
	beforeSubmit?: () => boolean | Promise<boolean>;
	/**
	 * Hook to check if the form is currently loading / awaiting a response.
	 * @param isLoading True if is awaiting a response else false.
	 */
	onLoading?: (isLoading: boolean) => void;
	/**
	 * Once a response has been received you can get the action result.
	 * @param result The resulting action of getting the response.
	 */
	onResult?: (result: ActionResult) => void;
}

let {
	isLoading = $bindable(),
	onLoading,
	onResult,
	children,
	onsubmit,
	beforeSubmit,
	...rest
}: Props = $props();

export const onSubmit: SubmitFunction = async ({ cancel }) => {
	const shouldSubmit = beforeSubmit ? await beforeSubmit() : true;
	if (!shouldSubmit) {
		return cancel();
	}

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
