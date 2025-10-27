"use client";

import ProjectModalWrapper from "@/components/ProjectModal/ProjectModalWrapper";
import { useEffect } from "react";

export default function NewProjectPage() {
	useEffect(() => {
		console.log("NewProjectPage mounted");
	}, []);

	return <ProjectModalWrapper mode="new" />;
}
