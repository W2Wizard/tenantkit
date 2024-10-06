<script lang="ts">
import type { Snippet } from "svelte";
import * as Tooltip from "./index";

interface Props {
	children?: Snippet;
	text: string;
}

const { children, text }: Props = $props();
</script>

<Tooltip.Root>
	{#if children}
		<Tooltip.Trigger>
			{@render children()}
		</Tooltip.Trigger>
	{/if}
	<Tooltip.Content class="max-w-[160px]">
		{text}
	</Tooltip.Content>
</Tooltip.Root>
