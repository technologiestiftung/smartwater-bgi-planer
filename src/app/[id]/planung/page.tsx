"use client";

import MeasurePlanningModule from "@/components/Modules/MeasurePlanningModule/MeasurePlanningModule";
import { useRouter } from "next/navigation";
import { use } from "react";

interface MaßnahmenplanungPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function MaßnahmenplanungPage({
	params,
}: MaßnahmenplanungPageProps) {
	const router = useRouter();
	const { id } = use(params);

	const handleClose = () => {
		router.push(`/${id}/menu`);
	};

	return (
		<MeasurePlanningModule
			open={true}
			onOpenChange={(open) => !open && handleClose()}
			projectId={id}
		/>
	);
}
