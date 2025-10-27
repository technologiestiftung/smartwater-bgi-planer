"use client";

import { cn } from "@/lib/utils";

interface SideMenuHeaderProps {
	title: string;
	className?: string;
}

export function SideMenuHeader({ title, className }: SideMenuHeaderProps) {
	return (
		<div
			className={cn(
				"SideMenuHeader-root border-muted relative flex h-[3.5rem] flex-shrink-0 items-center px-6",
				className,
			)}
		>
			<div className="flex-grow">
				<h4 className="text-primary">{title}</h4>
			</div>
		</div>
	);
}
