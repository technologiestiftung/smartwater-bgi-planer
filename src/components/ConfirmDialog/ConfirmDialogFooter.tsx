"use client";

import { cn } from "@/lib/utils";

interface ConfirmDialogFooterProps {
	children?: React.ReactNode;
	className?: string;
}

export function ConfirmDialogFooter({
	children,
	className,
}: ConfirmDialogFooterProps) {
	return (
		<div
			className={cn(
				"ConfirmDialogFooter-root border-muted flex shrink-0 items-center justify-end gap-2 border-t p-3",
				className,
			)}
		>
			{children}
		</div>
	);
}
