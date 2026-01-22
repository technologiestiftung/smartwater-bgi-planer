"use client";

import { Button } from "@/components/ui/button";
import SWLogo from "@/logos/SWLogo.svg";
import { useProjectsStore } from "@/store";
import { ListIcon } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
interface MenuToggleButtonProps {
	projectId: string;
}

export function MenuToggleButton({ projectId }: MenuToggleButtonProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { setLastPath } = useProjectsStore();

	const handleToggle = () => {
		if (pathname.includes("/menu")) {
			router.back();
		} else {
			setLastPath(pathname);
			router.push(`/${projectId}/menu`);
		}
	};

	return (
		<Button
			onClick={handleToggle}
			size="lg"
			variant="ghost"
			className="bg-background fixed top-4 right-4 z-49 flex h-16 w-56 gap-4 p-2 shadow-lg"
			aria-label="Toggle menu"
		>
			<SWLogo className="size-36" />
			<ListIcon className="text-primary size-4" />
		</Button>
	);
}
