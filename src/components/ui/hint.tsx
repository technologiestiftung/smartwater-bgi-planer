import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const hintVariants = cva(
	"group/hint flex items-start gap-3 p-2 transition-colors",
	{
		variants: {
			variant: {
				default: "bg-muted text-muted-darker",
				warning: "border-yellow-500 bg-yellow-500/5 text-foreground",
				success: "border-green-500 bg-green-500/5 text-foreground",
				error: "border-red-500 bg-red-500/5 text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Hint({
	className,
	variant = "default",
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof hintVariants>) {
	return (
		<div
			data-slot="hint"
			data-variant={variant}
			role="hint"
			className={cn(hintVariants({ variant, className }))}
			{...props}
		/>
	);
}

const hintIconVariants = cva(
	"flex shrink-0 items-center justify-center [&_svg]:pointer-events-none group-has-[[data-slot=hint-description]]/hint:self-start group-has-[[data-slot=hint-description]]/hint:translate-y-0.5",
	{
		variants: {
			variant: {
				default: "[&_svg:not([class*='size-'])]:size-5",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function HintIcon({
	className,
	variant = "default",
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof hintIconVariants>) {
	return (
		<div
			data-slot="hint-icon"
			data-variant={variant}
			className={cn(hintIconVariants({ variant, className }))}
			{...props}
		/>
	);
}

function HintContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="hint-content"
			className={cn("flex flex-1 flex-col gap-1.5", className)}
			{...props}
		/>
	);
}

function HintTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="hint-title"
			className={cn(
				"flex w-fit items-center gap-2 text-sm leading-snug font-semibold",
				className,
			)}
			{...props}
		/>
	);
}

function HintDescription({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="hint-description"
			className={cn(
				"text-foreground/80 text-sm leading-normal font-normal",
				className,
			)}
			{...props}
		/>
	);
}

function HintActions({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="hint-actions"
			className={cn("mt-2 flex items-center gap-2", className)}
			{...props}
		/>
	);
}

export {
	Hint,
	HintIcon,
	HintContent,
	HintTitle,
	HintDescription,
	HintActions,
	hintVariants,
};
