"use client";

import { cn } from "@/lib/utils";
import { XCircleIcon } from "@phosphor-icons/react";

interface ConfirmDialogHeaderProps {
	title: string;
	onClose: () => void;
	className?: string;
}

export function ConfirmDialogHeader({
	title,
	onClose,
	className,
}: ConfirmDialogHeaderProps) {
	return (
		<div
			className={cn(
				"ConfirmDialogHeader-root border-muted relative flex h-14 shrink-0 items-center border-b px-6",
				className,
			)}
		>
			<div className="flex-grow">
				<h4 className="text-primary">{title}</h4>
			</div>
			<button
				onClick={onClose}
				className="bg-secondary absolute top-0 right-0 flex size-14 cursor-pointer items-center justify-center"
			>
				<XCircleIcon className="size-6 text-white" />
			</button>
		</div>
	);
}
