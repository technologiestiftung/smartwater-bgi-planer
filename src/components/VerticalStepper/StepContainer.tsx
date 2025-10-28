import { cn } from "@/lib/utils";

interface StepContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function StepContainer({ children, className }: StepContainerProps) {
	return (
		<div className={cn("flex-1 overflow-y-auto p-2", className)}>
			{children}
		</div>
	);
}
