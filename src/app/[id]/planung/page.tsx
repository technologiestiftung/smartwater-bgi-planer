"use client";

import { MeasurePlanningModule } from "@/components/Modules/MeasurePlanningModule/MeasurePlanningModule";
import { useRouter } from "next/navigation";
import { use } from "react";

interface MaßnahmenplanungPageProps {
	params: Promise<{
		id: string;
	}>;
	searchParams: Promise<{
		info?: string;
		climateSimulation?: string;
	}>;
}

export default function MaßnahmenplanungPage({
	params,
	searchParams,
}: MaßnahmenplanungPageProps) {
	const router = useRouter();
	const { id } = use(params);
	const { info, climateSimulation } = use(searchParams);

	const handleClose = () => {
		router.push(`/${id}/menu`);
	};

	return (
		<MeasurePlanningModule
			open={true}
			onOpenChange={(open) => !open && handleClose()}
			projectId={id}
			info={info}
			climateSimulation={climateSimulation}
		/>
	);
}
