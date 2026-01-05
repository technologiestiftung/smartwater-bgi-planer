"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarProvider,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
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
	showStepper = true,
}: Omit<SideMenuProps, "open" | "onOpenChange" | "side" | "description"> & {
	showStepper?: boolean;
}) {
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
		showStepper = true,
	} = props;
	return (
		<SidebarProvider open={open} onOpenChange={onOpenChange}>
			<SideMenuInner
				title={title}
				footer={footer}
				bodyClassName={bodyClassName}
				showStepper={showStepper}
			>
				{children}
			</SideMenuInner>
		</SidebarProvider>
	);
}
