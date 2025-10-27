"use client";

import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogPortal,
} from "@/components/ui/dialog";
import { ModalHeader } from "./ModalHeader";
import { ModalFooter } from "./ModalFooter";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface PageModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	description?: string;
	bodyClassName?: string;
	className?: string;
	customBackdrop?: React.ReactNode;
}

export function PageModal({
	open,
	onOpenChange,
	title,
	children,
	footer,
	description,
	bodyClassName = "p-6 pt-8",
	className,
	customBackdrop,
}: PageModalProps) {
	if (customBackdrop) {
		// Custom rendering with backdrop
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogPortal>
					<DialogPrimitive.Overlay
						data-slot="dialog-overlay"
						className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50"
					>
						{customBackdrop}
					</DialogPrimitive.Overlay>
					<DialogPrimitive.Content
						data-slot="dialog-content"
						className={cn(
							"bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex max-h-full w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] flex-col border p-0 shadow-lg duration-200 md:max-h-[95vh]",
							className,
						)}
					>
						<DialogTitle className="sr-only">{title}</DialogTitle>
						{description && (
							<DialogDescription className="sr-only">
								{description}
							</DialogDescription>
						)}
						<ModalHeader title={title} />
						<div
							className={cn(
								"ModalBody-root flex-1 overflow-y-auto",
								bodyClassName,
							)}
						>
							{children}
						</div>
						{footer && <ModalFooter>{footer}</ModalFooter>}
					</DialogPrimitive.Content>
				</DialogPortal>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"bg-background flex max-h-full w-full max-w-2xl flex-col p-0 md:max-h-[95vh]",
					className,
				)}
				showCloseButton={false}
			>
				<DialogTitle className="sr-only">{title}</DialogTitle>
				{description && (
					<DialogDescription className="sr-only">
						{description}
					</DialogDescription>
				)}
				<ModalHeader title={title} />
				<div
					className={cn("ModalBody-root flex-1 overflow-y-auto", bodyClassName)}
				>
					{children}
				</div>
				{footer && <ModalFooter>{footer}</ModalFooter>}
			</DialogContent>
		</Dialog>
	);
}
