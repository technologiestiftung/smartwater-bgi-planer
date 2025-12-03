import { Button } from "@/components/ui/button";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ListChecksIcon,
} from "@phosphor-icons/react";
import { useCallback } from "react";

interface ModuleFooterProps {
	onClose: () => void;
	onShowSynthesis: () => void;
	useModuleNavigation: () => {
		getCurrentQuestionInfo: () => {
			isFirstQuestion: boolean;
			isLastQuestion: boolean;
		};
		navigateToPrevious: () => boolean;
		navigateToNext: () => boolean;
	};
	isNextDisabled?: boolean;
}

export function ModuleFooter({
	onClose,
	onShowSynthesis,
	useModuleNavigation,
	isNextDisabled = false,
}: ModuleFooterProps) {
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
				disabled={isNextDisabled}
				className="bg-secondary flex h-full w-18 items-center justify-center rounded-none"
			>
				<ListChecksIcon className="h-6 w-6 text-white" />
			</Button>
			<div className="flex w-full items-center justify-between p-2">
				<Button variant="ghost" onClick={handlePrevious}>
					<ArrowLeftIcon />
					{isFirstQuestion ? "Schließen" : "Zurück"}
				</Button>
				<Button variant="ghost" onClick={handleNext} disabled={isNextDisabled}>
					{isLastQuestion ? "Abschließen" : "Überspringen"}
					<ArrowRightIcon />
				</Button>
			</div>
		</div>
	);
}
