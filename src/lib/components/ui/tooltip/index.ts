import { Tooltip as TooltipPrimitive } from "bits-ui";
import Content from "./tooltip-content.svelte";
import QuickTip from "./tooltip.svelte";

const Root = TooltipPrimitive.Root;
const Trigger = TooltipPrimitive.Trigger;

export {
	Root,
	Trigger,
	Content,
	QuickTip,
	//
	Root as Tooltip,
	Content as TooltipContent,
	Trigger as TooltipTrigger,
};
