"use client";

import ProjectModal from "@/components/ProjectModal/ProjectModal";
import { useEffect } from "react";

export default function NewProjectPage() {
	useEffect(() => {
		console.log("NewProjectPage mounted");
	}, []);

	return <ProjectModal mode="new" />;
}
