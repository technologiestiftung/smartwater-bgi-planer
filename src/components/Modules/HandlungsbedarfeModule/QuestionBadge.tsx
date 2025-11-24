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

	const getBackgroundColor = () => {
		if (answer === true) return "bg-green-500";
		if (answer === false) return "bg-red-500";
		return "bg-gray-400";
	};

	const getTextColor = () => {
		if (answer === null) return "text-gray-600";
		return "text-white";
	};

	return (
		<button
			onClick={onToggle}
			className={`${getBackgroundColor()} ${getTextColor()} flex items-center gap-2 rounded px-3 py-1 text-sm font-medium transition-all hover:opacity-80`}
		>
			<span>{questionConfig.name}</span>
			{isVisible ? (
				<EyeIcon className="h-4 w-4" />
			) : (
				<EyeSlashIcon className="h-4 w-4" />
			)}
		</button>
	);
}
