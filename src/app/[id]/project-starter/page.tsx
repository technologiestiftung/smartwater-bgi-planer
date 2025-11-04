"use client";

import ProjectStarterModule from "@/components/Modules/ProjectStarterModule";
import { useRouter } from "next/navigation";
import { use } from "react";

interface ProjectStarterPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function ProjectStarterPage({
	params,
}: ProjectStarterPageProps) {
	const router = useRouter();
	const { id } = use(params);

	const handleComplete = () => {
		router.push(`/${id}/menu`);
	};

	return (
		<ProjectStarterModule
			open={true}
			onOpenChange={(open) => !open && router.back()}
			projectId={id}
			onComplete={handleComplete}
		/>
	);
}
