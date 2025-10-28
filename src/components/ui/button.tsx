import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm transition-all disabled:pointer-events-none  [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground hover:bg-secondary disabled:bg-muted-darker disabled:text-muted",
				destructive:
					"bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"border-primary border-2 disabled:bg-muted disabled:border-muted-darker disabled:text-muted-darker text-primary shadow-xs hover:bg-light dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost:
					"hover:bg-muted hover:text-foreground dark:hover:bg-primary/50 disabled:text-muted-darker",
				link: "text-primary underline-offset-4 hover:underline",
				"map-control": "shadow-md bg-white hover:bg-accent [&_svg]:size-6",
			},
			size: {
				default: "h-11 px-4 py-2 has-[>svg]:px-3 rounded-xs",
				sm: "h-8 rounded-xs gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-xs px-6 has-[>svg]:px-4",
				icon: "size-9",
				"icon-only": "h-12 w-12",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
