"use client";

import { cloneElement, isValidElement } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ConfirmDialogFooter } from "./ConfirmDialogFooter";
import { ConfirmDialogHeader } from "./ConfirmDialogHeader";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	content?: React.ReactNode;
	onConfirm: () => void;
	onCancel: () => void;
	confirmText?: string;
	confirmButton?: React.ReactNode;
	cancelText?: string;
	cancelButton?: React.ReactNode;
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
	onCancel,
	confirmText = "Bestätigen",
	confirmButton,
	cancelText = "Abbrechen",
	cancelButton,
	variant = "default",
	className,
	additionalButtons,
}: ConfirmDialogProps) {
	const cancelButtonElement = cancelButton ? (
		isValidElement<{ onClick?: () => void }>(cancelButton) ? (
			cloneElement(cancelButton, { onClick: onCancel })
		) : (
			<button type="button" onClick={onCancel}>
				{cancelButton}
			</button>
		)
	) : (
		<Button variant="outline" onClick={onCancel}>
			{cancelText}
		</Button>
	);

	const confirmButtonElement = confirmButton ? (
		isValidElement<{ onClick?: () => void }>(confirmButton) ? (
			cloneElement(confirmButton, { onClick: onConfirm })
		) : (
			<button type="button" onClick={onConfirm}>
				{confirmButton}
			</button>
		)
	) : (
		<Button variant={variant} onClick={onConfirm}>
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
				<ConfirmDialogHeader
					title={title}
					onClose={() => onOpenChange(false)}
				/>
				<div className="ConfirmDialog-root flex-1 overflow-y-auto p-6 pt-4">
					{bodyContent}
				</div>
				<ConfirmDialogFooter>{footer}</ConfirmDialogFooter>
			</DialogContent>
		</Dialog>
	);
}
