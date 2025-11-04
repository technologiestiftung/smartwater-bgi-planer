"use client";

import { useProjectsStore } from "@/store/projects";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProjectGuardProps {
	projectId: string;
	children: React.ReactNode;
}

export default function ProjectGuard({
	projectId,
	children,
}: ProjectGuardProps) {
	const router = useRouter();
	const { getProject, hasHydrated: _hasHydrated } = useProjectsStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted || !_hasHydrated) return;

		const project = getProject();

		if (!project) {
			console.warn("No project found, redirecting to /");
			router.replace("/");
			return;
		}

		if (project.id !== projectId) {
			console.log(`Redirecting to current project: ${project.id}`);
			router.replace(`/${project.id}`);
		}
	}, [mounted, _hasHydrated, projectId, getProject, router]);

	if (!mounted || !_hasHydrated) {
		return <>{children}</>;
	}

	const project = getProject();
	if (!project || project.id !== projectId) {
		return null;
	}

	return <>{children}</>;
}
