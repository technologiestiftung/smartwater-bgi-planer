"use client";

import { cn } from "@/lib/utils";
import { useLayersStore } from "@/store/layers";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { getModuleSteps } from "./moduleConfig";
import { usePathname } from "next/navigation";

interface SynthesisBadgeProps {
	questionId: string;
	answer: boolean | null;
	onToggle: () => void;
	isVisible: boolean;
	onBackToSpecificQuestion: (questionId: string, sectionId: string) => void;
}

export function SynthesisBadge({
	questionId,
	answer,
	onToggle,
	isVisible,
	onBackToSpecificQuestion,
}: SynthesisBadgeProps) {
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const questionConfig = layerConfig.find((config) => config.id === questionId);
	const pathname = usePathname();
	const moduleId = pathname.includes("/handlungsbedarfe")
		? "needForAction"
		: pathname.includes("/machbarkeit")
			? "feasibility"
			: null;
	const steps = getModuleSteps(moduleId as "needForAction" | "feasibility");

	if (!questionConfig) return null;

	const getBackgroundColor = () => {
		if (answer === null || answer === undefined) return "bg-neutral-light";
		if (answer === true) return "bg-red";
		if (answer === false) return "bg-green";
		return "bg-neutral-light";
	};

	return (
		<div
			className={`bg-neutral-light flex items-center gap-2 overflow-hidden rounded-sm text-sm font-medium transition-all hover:opacity-80`}
		>
			{answer !== undefined && (
				<div
					onClick={onToggle}
					className={cn(
						`${getBackgroundColor()} flex items-center justify-center overflow-hidden p-1 text-white`,
						!!answer && "cursor-pointer",
					)}
				>
					{answer && (
						<div>
							{isVisible ? (
								<EyeIcon className="h-4 w-4" />
							) : (
								<EyeSlashIcon className="h-4 w-4" />
							)}
						</div>
					)}
					{!answer && <div className="h-4 w-4" />}
				</div>
			)}
			<span
				className={cn(
					answer === undefined ? "h-6 translate-y-[1px] px-2" : "pr-2",
					"cursor-pointer select-none hover:underline",
				)}
				onClick={() => {
					const findStep = steps.find((step) =>
						step.questions?.some((q) => q === questionId),
					);
					if (!findStep?.id) return;
					onBackToSpecificQuestion(questionId, findStep.id);
				}}
			>
				{questionConfig.name}
			</span>
		</div>
	);
}
