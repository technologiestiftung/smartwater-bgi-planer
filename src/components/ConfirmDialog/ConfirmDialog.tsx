"use client";

import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialogHeader } from "./ConfirmDialogHeader";
import { ConfirmDialogFooter } from "./ConfirmDialogFooter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	content?: React.ReactNode;
	onConfirm: () => void;
	confirmText?: string;
	confirmButton?: React.ReactNode; // Custom confirm button
	cancelText?: string;
	cancelButton?: React.ReactNode; // Custom cancel button
	variant?: "default" | "destructive";
	className?: string;
	additionalButtons?: React.ReactNode;
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	content,
	onConfirm,
	confirmText = "Bestätigen",
	confirmButton,
	cancelText = "Abbrechen",
	cancelButton,
	variant = "default",
	className,
	additionalButtons,
}: ConfirmDialogProps) {
	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	const cancelButtonElement = cancelButton ? (
		<span onClick={handleCancel}>{cancelButton}</span>
	) : (
		<Button variant="outline" onClick={handleCancel}>
			{cancelText}
		</Button>
	);

	const confirmButtonElement = confirmButton ? (
		<span onClick={handleConfirm}>{confirmButton}</span>
	) : (
		<Button variant={variant} onClick={handleConfirm}>
			{confirmText}
		</Button>
	);

	const footer = (
		<>
			{cancelButtonElement}
			{additionalButtons}
			{confirmButtonElement}
		</>
	);

	const bodyContent = content || <p className="text-sm">{description || ""}</p>;

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
				<DialogDescription className="sr-only">
					{description || ""}
				</DialogDescription>
				<ConfirmDialogHeader title={title} onClose={handleCancel} />
				<div className="ConfirmDialog-root flex-1 overflow-y-auto p-6 pt-4">
					{bodyContent}
				</div>
				<ConfirmDialogFooter>{footer}</ConfirmDialogFooter>
			</DialogContent>
		</Dialog>
	);
}
