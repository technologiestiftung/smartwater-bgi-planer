import { useCallback, useState } from "react";
import type { SectionId } from "../constants";

export const useSectionQuestionState = () => {
	const [questionIndices, setQuestionIndices] = useState<
		Record<SectionId, number>
	>({
		heavyRain: 0,
		heat: 0,
		sealing: 0,
		waterBalance: 0,
		waterProtection: 0,
	});

	const setQuestionIndex = useCallback(
		(sectionId: SectionId, index: number) => {
			setQuestionIndices((prev) => ({
				...prev,
				[sectionId]: index,
			}));
		},
		[],
	);

	return { questionIndices, setQuestionIndex };
};
