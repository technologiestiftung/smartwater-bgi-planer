"use client";

import NeedForActionModule from "@/components/Modules/NeedForActionModule/NeedForActionModule";
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
		<NeedForActionModule
			open={true}
			onOpenChange={(open) => !open && handleClose()}
			projectId={id}
		/>
	);
}
