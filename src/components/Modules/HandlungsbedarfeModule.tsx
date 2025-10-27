"use client";

import { SideMenu } from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ListChecksIcon,
} from "@phosphor-icons/react";

interface HandlungsbedarfeModuleProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
}

export default function HandlungsbedarfeModule({
	open,
	onOpenChange,
}: HandlungsbedarfeModuleProps) {
	const footer = (
		<div className="flex h-full w-full">
			<div className="bg-secondary flex w-[4.5rem] items-center justify-center">
				<ListChecksIcon className="h-6 w-6 text-white" />
			</div>
			<div className="flex w-full items-center justify-between p-2">
				<Button variant="ghost" onClick={() => onOpenChange(false)}>
					<ArrowLeftIcon />
					Zurück
				</Button>
				<Button variant="ghost">
					<ArrowRightIcon />
					Überspringen
				</Button>
			</div>
		</div>
	);

	return (
		<SideMenu
			open={open}
			onOpenChange={onOpenChange}
			title="Handlungsbedarfe"
			description="Untersuchen Sie Ihr Gebiet auf Handlungsbedarfe"
			footer={footer}
		>
			<div>
				<div className="mb-6 text-left"></div>
				<div className="flex flex-col gap-6"></div>
			</div>
		</SideMenu>
	);
}
