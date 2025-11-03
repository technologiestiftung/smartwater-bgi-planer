"use client";

import { useProjectsStore } from "@/store/projects";
import { PROJECT_MODE } from "@/store/projects/config";
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
	const { getProject, getAllProjects, _hasHydrated } = useProjectsStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted || !_hasHydrated) return;

		if (PROJECT_MODE === "single") {
			const allProjects = getAllProjects();
			if (allProjects.length > 0 && allProjects[0].id !== projectId) {
				console.log(`Redirecting to single project: ${allProjects[0].id}`);
				router.replace(`/${allProjects[0].id}`);
				return;
			}
			if (allProjects.length === 0) {
				console.warn("No project found, redirecting to /new");
				router.replace("/new");
			}
		} else {
			const project = getProject(projectId);
			if (!project) {
				console.warn(`Project ${projectId} not found, redirecting to /new`);
				router.replace("/new");
			}
		}
	}, [mounted, _hasHydrated, projectId, getProject, getAllProjects, router]);

	if (!mounted || !_hasHydrated) {
		return <>{children}</>;
	}

	if (PROJECT_MODE === "single") {
		const allProjects = getAllProjects();
		if (allProjects.length === 0 || allProjects[0].id !== projectId) {
			return null; // Don't render while redirecting
		}
	} else {
		const project = getProject(projectId);
		if (!project) {
			return null; // Don't render while redirecting
		}
	}

	return <>{children}</>;
}
