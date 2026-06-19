"use client";

import { SpinnerIcon } from "@phosphor-icons/react";

export function DeleteModalContent() {
	return (
		<div className="my-6 hidden flex-wrap items-center justify-center gap-2 lg:flex">
			<SpinnerIcon size={32} className="animate-spin [animation-duration:3s]" />
			<p>Projekt wird gelöscht...</p>
		</div>
	);
}
