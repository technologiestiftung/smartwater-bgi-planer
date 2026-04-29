"use client";

import MeasureDetailsCard from "@/components/FeatureDetailViews/MeasureDetailsCard/MeasureDetailsCard";
import { useUiStore } from "@/store/ui";
import { FC } from "react";

const MeasureDetailsCardStack: FC = () => {
	const openMeasureCardIds = useUiStore((state) => state.openMeasureCardIds);
	const closeMeasureCard = useUiStore((state) => state.closeMeasureCard);

	if (openMeasureCardIds.length === 0) {
		return null;
	}

	return (
		<div className="pointer-events-none absolute top-24 right-2 z-20 flex max-h-[calc(100%-2rem)] w-fit flex-col gap-3 overflow-y-auto pr-2">
			{openMeasureCardIds.map((measureId) => (
				<div key={measureId} className="pointer-events-auto">
					<MeasureDetailsCard
						measureId={measureId}
						onClose={() => closeMeasureCard(measureId)}
					/>
				</div>
			))}
		</div>
	);
};

export default MeasureDetailsCardStack;
