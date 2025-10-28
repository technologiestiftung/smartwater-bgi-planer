"use client";

import { Button } from "@/components/ui/button";
import { ListIcon } from "@phosphor-icons/react";
import { useRouter, usePathname } from "next/navigation";
import SWLogo from "@/logos/SWLogo.svg";
interface MenuToggleButtonProps {
	projectId: string;
}

export function MenuToggleButton({ projectId }: MenuToggleButtonProps) {
	const router = useRouter();
	const pathname = usePathname();

	const handleToggle = () => {
		if (pathname.includes("/menu")) {
			router.back();
		} else {
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
