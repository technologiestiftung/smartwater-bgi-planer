"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarProvider,
} from "@/components/ui/sidebar";
import { SideMenuHeader } from "./SideMenuHeader";
import { SideMenuFooter } from "./SideMenuFooter";
import { cn } from "@/lib/utils";

interface SideMenuProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	side?: "left" | "right";
	bodyClassName?: string;
}

function SideMenuInner({
	title,
	children,
	footer,
	bodyClassName = "p-6",
}: Omit<SideMenuProps, "open" | "onOpenChange" | "side" | "description">) {
	return (
		<Sidebar collapsible="offcanvas">
			<SidebarHeader className="flex flex-row">
				<div className="w-20" />
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

export function SideMenu({
	open,
	onOpenChange,
	title,
	children,
	footer,
	bodyClassName = "p-6",
}: SideMenuProps) {
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
