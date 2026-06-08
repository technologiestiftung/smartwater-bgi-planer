"use client";

import type { SectionId } from "@/lib/helpers/sectionIds";
import { cn } from "@/lib/utils";
import { selectLayerConfigById, useLayersStore } from "@/store/layers";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { getModuleSteps } from "./moduleConfig";

interface SynthesisBadgeProps {
	configId: string;
	answer: boolean | null;
	onToggle: () => void;
	isVisible: boolean;
	onBackToSpecificQuestion: (configId: string, sectionId: SectionId) => void;
}

// eslint-disable-next-line complexity
export function SynthesisBadge({
	configId,
	answer,
	onToggle,
	isVisible,
	onBackToSpecificQuestion,
}: SynthesisBadgeProps) {
	const config = useLayersStore((state) =>
		selectLayerConfigById(state, configId),
	);
	const pathname = usePathname();
	// eslint-disable-next-line no-nested-ternary
	const moduleId = pathname.includes("/handlungsbedarfe")
		? "needForAction"
		: pathname.includes("/machbarkeit")
			? "feasibility"
			: null;

	if (!moduleId) return null;

	const steps = getModuleSteps(moduleId as "needForAction" | "feasibility");

	if (!config) return null;

	const getBackgroundColor = () => {
		if (answer === null || answer === undefined) return "bg-neutral-light";
		if (answer === true) return "bg-red";
		if (answer === false) return "bg-green";
		return "bg-neutral-light";
	};

	return (
		<div
			className={`bg-neutral-light flex min-h-6 items-center gap-2 overflow-hidden rounded-sm text-sm font-medium transition-all hover:opacity-80`}
		>
			{answer !== undefined && (
				<button
					type="button"
					onClick={onToggle}
					aria-pressed={isVisible}
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
				</button>
			)}
			<button
				type="button"
				className={cn(
					answer === undefined ? "px-2" : "pr-2",
					"h-6 cursor-pointer select-none hover:underline",
				)}
				onClick={() => {
					const findStep = steps.find((step) =>
						step.questions?.some((q) => q === configId),
					);
					if (!findStep?.id) return;
					onBackToSpecificQuestion(configId, findStep.id);
				}}
			>
				{config.name}
			</button>
		</div>
	);
}
