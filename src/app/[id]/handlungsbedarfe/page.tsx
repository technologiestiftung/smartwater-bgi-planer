"use client";

import HandlungsbedarfeModule from "@/components/Modules/HandlungsbedarfeModule/HandlungsbedarfeModule";
import { useRouter } from "next/navigation";
import { use } from "react";

interface HandlungsbedarfePageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function HandlungsbedarfePage({
	params,
}: HandlungsbedarfePageProps) {
	const router = useRouter();
	const { id } = use(params);

	const handleClose = () => {
		router.push(`/${id}/menu`);
	};

	return (
		<HandlungsbedarfeModule
			open={true}
			onOpenChange={(open) => !open && handleClose()}
			projectId={id}
		/>
	);
}
