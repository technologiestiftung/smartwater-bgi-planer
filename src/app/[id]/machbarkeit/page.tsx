"use client";

import FeasibilityModule from "@/components/Modules/FeasibilityModule/FeasibilityModule";
import { useRouter } from "next/navigation";
import { use } from "react";

interface MachbarkeitPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function MachbarkeitPage({ params }: MachbarkeitPageProps) {
	const router = useRouter();
	const { id } = use(params);

	const handleClose = () => {
		router.push(`/${id}/menu`);
	};

	return (
		<FeasibilityModule
			open={true}
			onOpenChange={(open) => !open && handleClose()}
			projectId={id}
		/>
	);
}
