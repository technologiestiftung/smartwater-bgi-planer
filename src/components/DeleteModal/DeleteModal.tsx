"use client";
import { DeleteModalContent } from "@/components/DeleteModal/DeleteModalContent";
import { PageModal } from "@/components/Modal";
import { useProjectStore } from "@/store/project";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function DeleteModal() {
	const router = useRouter();
	const { deleteProject } = useProjectStore();

	useEffect(() => {
		const timer = setTimeout(() => {
			deleteProject();
			router.push("/");
		}, 3000);
		return () => clearTimeout(timer);
	}, [router]);

	return (
		<PageModal
			open={true}
			onOpenChange={() => undefined}
			title="Projekt löschen"
			bodyClassName=""
			className="max-w-4xl"
		>
			<DeleteModalContent />
		</PageModal>
	);
}
