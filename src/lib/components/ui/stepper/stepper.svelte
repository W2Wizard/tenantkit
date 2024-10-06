<script lang="ts">
import type { Snippet } from "svelte";

interface Props {
	steps: string[];
	value: number;
}

let { steps = [], value = $bindable(0) }: Props = $props();

function goToStep(step: number) {
	if (step >= 0 && step < steps.length) {
		value = step;
	}
}
</script>

<div class="flex items-center">
	{#each steps as step, index}
		{@const full = index < steps.length - 1 ? "w-full" : ""}
		{@const background = index <= value ? "bg-primary text-white" : "bg-muted"}
		<div class="flex flex-col items-center">
			<button
				class="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full {background}"
				onclick={() => goToStep(index)}
			>
				{index + 1}
			</button>
			<span class="mt-2 text-sm">{step}</span>
		</div>
		{#if index < steps.length - 1}
			{@const filled = index < value ? "bg-primary" : "bg-muted"}
			<hr class="mx-1 mb-6 h-1.5 w-full flex-1 rounded border-t-0 {filled}" />
		{/if}
	{/each}
</div>
