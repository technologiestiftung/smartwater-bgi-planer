import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pillVariants = cva(
	"group/pill inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-sm font-medium w-fit whitespace-nowrap shrink-0 gap-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
				outline:
					"text-white border-white [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				"outline-dark": "border-primary text-primary [a&]:hover:bg-primary/90",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Pill({
	className,
	variant = "default",
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof pillVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span";

	return (
		<Comp
			data-slot="pill"
			data-variant={variant}
			className={cn(pillVariants({ variant, className }))}
			{...props}
		/>
	);
}

const pillIconVariants = cva(
	"inline-flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
	{
		variants: {
			position: {
				left: "order-1",
				right: "order-3",
			},
		},
		defaultVariants: {
			position: "left",
		},
	},
);

function PillIcon({
	className,
	position = "left",
	...props
}: React.ComponentProps<"span"> & VariantProps<typeof pillIconVariants>) {
	return (
		<span
			data-slot="pill-icon"
			data-position={position}
			className={cn(pillIconVariants({ position, className }))}
			{...props}
		/>
	);
}

function PillContent({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="pill-content"
			className={cn("order-2", className)}
			{...props}
		/>
	);
}

export { Pill, PillIcon, PillContent, pillVariants };
