"use client";

import { DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { XCircleIcon } from "@phosphor-icons/react";

interface ModalHeaderProps {
	title: string;
	className?: string;
}

export function ModalHeader({ title, className }: ModalHeaderProps) {
	return (
		<div
			className={cn(
				"ModalHeader-root border-muted relative flex h-14 shrink-0 items-center border-b px-6",
				className,
			)}
		>
			<div className="grow">
				<h4 className="text-primary">{title}</h4>
			</div>
			<DialogClose className="bg-secondary absolute top-0 right-0 flex size-14 cursor-pointer items-center justify-center">
				<XCircleIcon className="size-6 text-white" />
			</DialogClose>
		</div>
	);
}
