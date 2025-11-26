import { useLayersStore } from "@/store/layers";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

interface QuestionBadgeProps {
	questionId: string;
	answer: boolean | null;
	onToggle: () => void;
	isVisible: boolean;
}

export function QuestionBadge({
	questionId,
	answer,
	onToggle,
	isVisible,
}: QuestionBadgeProps) {
	const layerConfig = useLayersStore((state) => state.layerConfig);
	const questionConfig = layerConfig.find((config) => config.id === questionId);

	if (!questionConfig) return null;

	console.log("[QuestionBadge] answer::", answer);

	const getBackgroundColor = () => {
		if (answer === null || answer === undefined) return "bg-neutral-light";
		if (answer === true) return "bg-red";
		if (answer === false) return "bg-green";
		return "bg-neutral-light";
	};

	return (
		<button
			onClick={onToggle}
			className={`bg-neutral-light flex items-center gap-2 overflow-hidden rounded-sm text-sm font-medium transition-all hover:opacity-80`}
		>
			{answer !== undefined && (
				<div
					className={`${getBackgroundColor()} flex items-center justify-center overflow-hidden p-1 text-white`}
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
			<span className={`${answer === undefined && "pl-2"} pr-2`}>
				{questionConfig.name}
			</span>
		</button>
	);
}
