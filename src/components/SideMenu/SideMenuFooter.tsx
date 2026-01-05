"use client";

import { cn } from "@/lib/utils";

interface SideMenuFooterProps {
	children?: React.ReactNode;
	className?: string;
}

export function SideMenuFooter({ children, className }: SideMenuFooterProps) {
	return (
		<div
			className={cn(
				"SideMenuFooter-root border-muted flex h-16 flex-shrink-0 items-center justify-end gap-2 border-t",
				className,
			)}
		>
			{children}
		</div>
	);
}
