"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Icon from "@/components/Icon";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants, ShadButton } from "@/components/ui/button";

interface ButtonProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	/** Text label inside the button */
	text: string;
	/** Optional Phosphor icon ID (passed to <Icon />) */
	icon?: string;
	/** Disable button and prevent clicks */
	disabled?: boolean;
}

export function Button({
	text,
	icon = "note-pencil",
	disabled = false,
	onClick,
	variant,
	className,
	...props
}: ButtonProps) {
	const isDisabled = !onClick || disabled;

	return (
		<ShadButton
			variant={variant}
			disabled={isDisabled}
			onClick={isDisabled ? undefined : onClick}
			className={cn(
				buttonVariants({ variant, disabled: isDisabled }),
				className,
			)}
			{...props}
		>
			{icon && <Icon id={icon} className="text-2xl" />}
			<p className="select-none">{text}</p>
		</ShadButton>
	);
}
