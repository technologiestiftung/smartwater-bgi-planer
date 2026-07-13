"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarProvider,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui";
import { SideMenuFooter } from "./SideMenuFooter";
import { SideMenuHeader } from "./SideMenuHeader";

interface SideMenuProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	side?: "left" | "right";
	bodyClassName?: string;
	showStepper?: boolean;
}

function SideMenuInner({
	title,
	children,
	footer,
	bodyClassName = "p-6",
}: Omit<
	SideMenuProps,
	"open" | "onOpenChange" | "side" | "description" | "showStepper"
>) {
	const showStepper = useUiStore((state) => state.showStepper);
	return (
		<Sidebar collapsible="offcanvas">
			<SidebarHeader className="flex flex-row">
				<div className={showStepper ? "w-20" : "w-4"} />
				<SideMenuHeader title={title} />
			</SidebarHeader>
			<SidebarContent className={cn("overflow-y-auto", bodyClassName)}>
				{children}
			</SidebarContent>
			{footer && (
				<SidebarFooter className="p-0">
					<SideMenuFooter>{footer}</SideMenuFooter>
				</SidebarFooter>
			)}
		</Sidebar>
	);
}

export function SideMenu(props: SideMenuProps) {
	const {
		open,
		onOpenChange,
		title,
		children,
		footer,
		bodyClassName = "p-6",
	} = props;
	return (
		<SidebarProvider open={open} onOpenChange={onOpenChange}>
			<SideMenuInner
				title={title}
				footer={footer}
				bodyClassName={bodyClassName}
			>
				{children}
			</SideMenuInner>
		</SidebarProvider>
	);
}
