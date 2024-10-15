<script lang="ts">
import { Calendar } from "lucide-svelte";
import type { DateRange } from "bits-ui";
import {
	CalendarDate,
	DateFormatter,
	type DateValue,
	getLocalTimeZone,
} from "@internationalized/date";
import { cn } from "$lib/utils.js";
import { Button } from "$lib/components/ui/button/index.js";
import { RangeCalendar } from "$lib/components/ui/range-calendar/index.js";
import * as Popover from "$lib/components/ui/popover/index.js";

interface Props {
	value: DateRange | undefined;
}

let { value = $bindable(undefined) }: Props = $props();
const df = new DateFormatter("en-US", {
	dateStyle: "medium",
});
</script>

<div class="grid gap-2">
	<Popover.Root openFocus>
		<Popover.Trigger asChild let:builder>
			<Button
				variant="outline"
				class={cn(
					"w-[300px] justify-start text-left font-normal",
					!value && "text-muted-foreground"
				)}
				builders={[builder]}
			>
				<Calendar class="mr-2 h-4 w-4" />
				{#if value && value.start}
					{#if value.end}
						{df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
							value.end.toDate(getLocalTimeZone())
						)}
					{:else}
						{df.format(value.start.toDate(getLocalTimeZone()))}
					{/if}
					<!-- {:else if startValue}
					{df.format(startValue.toDate(getLocalTimeZone()))} -->
				{:else}
					Pick a date
				{/if}
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0" align="start">
			<RangeCalendar bind:value placeholder={value?.start} initialFocus numberOfMonths={2} />
		</Popover.Content>
	</Popover.Root>
</div>
