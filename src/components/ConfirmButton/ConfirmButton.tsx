"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { FC, useState } from "react";
import { Button } from "../ui/button";
import { useVerticalStepper } from "../VerticalStepper";

interface ConfirmButtonProps {
	onConfirm?: () => boolean | Promise<boolean>;
	validate?: () => boolean;
	displayText?: string;
	autoAdvanceStep?: boolean;
	buttonText?: string;
}

const ConfirmButton: FC<ConfirmButtonProps> = ({
	onConfirm,
	validate,
	displayText,
	autoAdvanceStep = true,
	buttonText = "Bestätigen",
}) => {
	const { nextStep } = useVerticalStepper();
	const [isLoading, setIsLoading] = useState(false);

	const isValid = validate ? validate() : true;

	const handleConfirm = async () => {
		if (!onConfirm) {
			if (autoAdvanceStep) {
				nextStep();
			}
			return;
		}

		setIsLoading(true);
		try {
			const result = await Promise.resolve(onConfirm());

			if (result && autoAdvanceStep) {
				nextStep();
			}
		} catch (error) {
			console.error("[ConfirmButton] Error during confirm:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="ConfirmButton-root flex items-center gap-2">
			<Button
				onClick={handleConfirm}
				disabled={!isValid || isLoading}
				className="gap-2"
			>
				<CheckIcon />
				{isLoading ? "Wird verarbeitet..." : buttonText}
			</Button>
			{displayText && (
				<p className="text-muted-foreground text-sm">{displayText}</p>
			)}
		</div>
	);
};

export default ConfirmButton;
