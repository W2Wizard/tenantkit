<script lang="ts">
import * as AlertDialog from "$lib/components/ui/alert-dialog";
import Button from "../ui/button/button.svelte";
import { dialog } from "./";

function resolve(value?: unknown) {
	switch (dialog.current?.type) {
		case "confirm": {
			dialog.current?.resolve(Boolean(value));
			break;
		}
		case "alert": {
			dialog.current?.resolve();
			break;
		}
		default:
			break;
	}

	dialog.current = null;
}
</script>

<AlertDialog.Root open={dialog.current !== null}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>
				{dialog.current?.title}
			</AlertDialog.Title>
			<AlertDialog.Description>
				{dialog.current?.message}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			{@const isConfirm = dialog.current?.type === "confirm"}
			{#if isConfirm}
				<AlertDialog.Cancel asChild let:builder>
					<Button
						on:click={() => resolve(false)}
						variant="outline"
						size="sm"
						class="h-7 gap-1"
						builders={[builder]}
					>
						Cancel
					</Button>
				</AlertDialog.Cancel>
			{/if}
			<AlertDialog.Action asChild let:builder>
				<Button
					on:click={() => (isConfirm ? resolve(true) : resolve())}
					variant="default"
					size="sm"
					class="h-7 gap-1"
					builders={[builder]}
				>
					{#if isConfirm}
						Confirm
					{:else}
						Ok
					{/if}
				</Button>
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
