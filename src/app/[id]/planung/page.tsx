"use client";

import MeasurePlaningModule from "@/components/Modules/MeasurePlaningModule/MeasurePlaningModule";
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
	console.log("Rendering MaßnahmenplanungPage");
	const router = useRouter();
	const { id } = use(params);

	const handleClose = () => {
		router.push(`/${id}/menu`);
	};

	return (
		<MeasurePlaningModule
			open={true}
			onOpenChange={(open) => !open && handleClose()}
			projectId={id}
		/>
	);
}
