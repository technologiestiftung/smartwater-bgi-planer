"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
	return (
		<CheckboxPrimitive.Root
			ref={ref}
			className={cn(
				// base layout / sizing
				"aspect-square size-5 shrink-0 rounded-xs",

				// borders & colors
				"border-foreground text-foreground border-2",

				// background
				"dark:bg-input/30",

				// effects
				"shadow-xs transition-[color,box-shadow] outline-none",

				// focus
				"focus-visible:border-ring focus-visible:ring-ring/50 cursor-pointer focus-visible:ring-[3px]",

				// invalid state
				"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",

				// disabled
				"disabled:cursor-not-allowed disabled:opacity-50",

				// className from props
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
				<img src="/icons/checkbox-tick.svg" className="h-3.5 w-3.5" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
