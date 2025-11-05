"use client";

import * as React from "react";
import { ConfirmDialog } from "./ConfirmDialog";

interface UseConfirmDialogOptions {
	title: string;
	description?: string;
	content?: React.ReactNode;
	confirmText?: string;
	confirmButton?: React.ReactNode;
	cancelText?: string;
	cancelButton?: React.ReactNode;
	variant?: "default" | "destructive";
	additionalButtons?: React.ReactNode;
}

interface UseConfirmDialogReturn {
	ConfirmDialog: React.FC;
	confirm: () => Promise<boolean>;
}

/**
 * Hook to programmatically show a confirm dialog
 *
 */
export function useConfirmDialog({
	title,
	description,
	content,
	confirmText,
	confirmButton,
	cancelText,
	cancelButton,
	variant = "default",
	additionalButtons,
}: UseConfirmDialogOptions): UseConfirmDialogReturn {
	const [open, setOpen] = React.useState(false);
	const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

	const confirm = React.useCallback(() => {
		setOpen(true);
		return new Promise<boolean>((resolve) => {
			resolveRef.current = resolve;
		});
	}, []);

	const handleConfirm = React.useCallback(() => {
		resolveRef.current?.(true);
		setOpen(false);
	}, []);

	const handleCancel = React.useCallback(() => {
		resolveRef.current?.(false);
		setOpen(false);
	}, []);

	const DialogComponent = React.useCallback(
		() => (
			<ConfirmDialog
				open={open}
				onOpenChange={handleCancel}
				title={title}
				description={description}
				content={content}
				onConfirm={handleConfirm}
				confirmText={confirmText}
				confirmButton={confirmButton}
				cancelText={cancelText}
				cancelButton={cancelButton}
				variant={variant}
				additionalButtons={additionalButtons}
			/>
		),
		[
			open,
			title,
			description,
			content,
			confirmText,
			confirmButton,
			cancelText,
			cancelButton,
			variant,
			handleConfirm,
			handleCancel,
			additionalButtons,
		],
	);

	return { ConfirmDialog: DialogComponent, confirm };
}
