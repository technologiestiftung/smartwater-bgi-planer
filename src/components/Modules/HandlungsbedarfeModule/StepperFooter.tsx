import { useModuleNavigation } from "@/components/Modules/HandlungsbedarfeModule/hooks/useModuleNavigation";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ListChecksIcon,
} from "@phosphor-icons/react";
import { useCallback } from "react";
import { Button } from "../../ui/button";

interface StepperFooterProps {
	onClose: () => void;
	onShowSynthesis: () => void;
}

export function StepperFooter({
	onClose,
	onShowSynthesis,
}: StepperFooterProps) {
	const { getCurrentQuestionInfo, navigateToPrevious, navigateToNext } =
		useModuleNavigation();

	const { isFirstQuestion, isLastQuestion } = getCurrentQuestionInfo();

	const handlePrevious = useCallback(() => {
		const success = navigateToPrevious();
		if (!success) {
			onClose();
		}
	}, [navigateToPrevious, onClose]);

	const handleNext = useCallback(() => {
		const success = navigateToNext();
		if (!success) {
			onShowSynthesis();
		}
	}, [navigateToNext, onShowSynthesis]);

	return (
		<div className="border-muted flex h-full w-full border-t">
			<Button
				onClick={onShowSynthesis}
				variant="ghost"
				className="bg-secondary flex h-full w-18 items-center justify-center rounded-none"
			>
				<ListChecksIcon className="h-6 w-6 text-white" />
			</Button>
			<div className="flex w-full items-center justify-between p-2">
				<Button variant="ghost" onClick={handlePrevious}>
					<ArrowLeftIcon />
					{isFirstQuestion ? "Schließen" : "Zurück"}
				</Button>
				<Button variant="ghost" onClick={handleNext}>
					{isLastQuestion ? "Abschließen" : "Überspringen"}
					<ArrowRightIcon />
				</Button>
			</div>
		</div>
	);
}
