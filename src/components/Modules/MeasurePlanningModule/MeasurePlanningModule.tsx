"use client";

import { getModuleMetadata } from "@/components/Modules/shared/moduleConfig";
import { useUiStore } from "@/store/ui";
import { useEffect } from "react";
import { MeasurePlanningAccordion } from "./MeasurePlanningAccordion";

interface MeasurePlanningModuleProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
	info?: string;
	climateSimulation?: string;
	floodRisk?: string;
}

export function MeasurePlanningModule({
	open,
	onOpenChange,
	info,
	climateSimulation,
	floodRisk,
}: MeasurePlanningModuleProps) {
	const { title, description } = getModuleMetadata("measurePlanning");

	const resetModuleState = useUiStore((state) => state.resetModuleState);
	useEffect(() => {
		resetModuleState();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<MeasurePlanningAccordion
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			description={description}
			info={info}
			climateSimulation={climateSimulation}
			floodRisk={floodRisk}
		/>
	);
}
