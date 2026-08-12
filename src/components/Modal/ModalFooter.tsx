"use client";

import { cn } from "@/lib/utils";

interface ModalFooterProps {
	children?: React.ReactNode;
	className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
	return (
		<div
			className={cn(
				"ModalFooter-root border-muted flex flex-shrink-0 items-center justify-end gap-2 border-t p-3",
				className,
			)}
		>
			{children}
		</div>
	);
}
