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
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted || !_hasHydrated) return;

		const project = getProject();

		if (project) {
			if (project.id !== projectId) {
				router.replace(`/${project.id}`);
			}
		} else {
			console.warn("No project found, redirecting to /");
			router.replace("/");
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
