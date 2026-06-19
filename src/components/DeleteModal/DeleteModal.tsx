"use client";
import { DeleteModalContent } from "@/components/DeleteModal/DeleteModalContent";
import { PageModal } from "@/components/Modal";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function DeleteModal() {
	const router = useRouter();

	useEffect(() => {
		const timer = setTimeout(() => {
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
