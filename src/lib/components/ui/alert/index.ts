import { type VariantProps, tv } from "tailwind-variants";

import Root from "./alert.svelte";
import Description from "./alert-description.svelte";
import Title from "./alert-title.svelte";

export const alertVariants = tv({
	base: "[&>svg]:text-foreground relative w-full rounded-lg border p-4 [&:has(svg)]:pl-11 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",

	variants: {
		variant: {
			default: "bg-background text-foreground",
			info: "bg-blue-100 border-blue-500 text-blue-700 [&>svg]:text-blue-700",
			warning: "bg-yellow-100 border-yellow-500 text-yellow-700 [&>svg]:text-yellow-700",
			destructive:
				"border-destructive/50 text-destructive text-destructive dark:border-destructive [&>svg]:text-destructive",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export type Variant = VariantProps<typeof alertVariants>["variant"];
export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export {
	Root,
	Description,
	Title,
	//
	Root as Alert,
	Description as AlertDescription,
	Title as AlertTitle,
};
