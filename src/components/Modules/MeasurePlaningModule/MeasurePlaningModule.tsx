"use client";

import { getModuleMetadata } from "@/components/Modules/shared/moduleConfig";
import { useUiStore } from "@/store/ui";
import { useEffect } from "react";
import { MeasurePlaningAccordion } from "./MeasurePlaningAccordion";

interface MeasurePlaningModuleProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
}

export default function MeasurePlaningModule({
	open,
	onOpenChange,
}: MeasurePlaningModuleProps) {
	const { title, description } = getModuleMetadata("measurePlaning");

	const resetModuleState = useUiStore((state) => state.resetModuleState);
	useEffect(() => {
		resetModuleState();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<MeasurePlaningAccordion
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			description={description}
		/>
	);
}
