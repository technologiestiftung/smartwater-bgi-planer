"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModuleMeasurementConfig } from "@/types/shared";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getModuleStepMeasure } from "../Modules/shared/moduleConfig";
import dropdownMenus from "./dropDownMenus.json";

interface ClimateSimulationModalProps {
	climateSimulation: string;
}

type DropdownMenuOption = {
	display: string;
	value?: string;
	disableIfFileNameIncludes?: string;
};

type DropdownMenuConfig = {
	title: string;
	options: DropdownMenuOption[];
};

const typedDropdownMenus = dropdownMenus as DropdownMenuConfig[];

type DropdownSelection = {
	display: string;
	value?: string;
	disableIfFileNameIncludes?: string;
};

export function ClimateSimulationModal({
	climateSimulation,
}: ClimateSimulationModalProps) {
	const getModuleInfo = getModuleStepMeasure(
		"measurePlanning",
		climateSimulation,
	) as ModuleMeasurementConfig;
	const { info: { climateSimulationFileSlug } = {} } = getModuleInfo || {};
	const fileType = ".webp";
	const [imgError, setImageError] = useState(false);
	const [selections, setSelections] = useState<DropdownSelection[]>(
		() =>
			typedDropdownMenus?.map((m) => {
				const first = m.options[0];
				return {
					display: first.display,
					value: first.value || first.display,
					disableIfFileNameIncludes: first.disableIfFileNameIncludes,
				};
			}) || [],
	);
	const fileName = `/images/climateSimulation/${climateSimulationFileSlug}_${selections
		.map((s) => sanitizeString(s.value || s.display))
		.join("_")}${fileType}`;

	function sanitizeString(input: string) {
		return input.replace(/[%:]/g, "");
	}

	const updateSelection = (menuIndex: number, option: DropdownSelection) => {
		setSelections((prev) => {
			const next = [...prev];
			next[menuIndex] = {
				display: option.display,
				value: option.value || option.display,
				disableIfFileNameIncludes: option.disableIfFileNameIncludes,
			};
			return next;
		});
	};

	useEffect(() => {
		setImageError(false);
	}, [fileName]);

	if (!dropdownMenus) {
		return null;
	}

	const imageAlt = typedDropdownMenus
		.map((menu, index) => `${menu.title}: ${selections[index]?.display}`)
		.join(", ");

	return (
		<div
			className="ClimateSimulation-Overlay fixed inset-0 z-40 ml-136 flex items-center justify-start bg-black/60 p-2 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
			aria-label="Klimasimulation"
		>
			<div className="flex h-full w-full max-w-6xl flex-col gap-4 bg-white p-6">
				<div className="flex flex-wrap items-end justify-between gap-2">
					{typedDropdownMenus.map((menu, index) => (
						<div key={index}>
							<p className="text-primary mb-2 font-bold whitespace-pre-line">
								{menu.title}
							</p>
							<DropdownMenu>
								<DropdownMenuTrigger className="bg-neutral-mid text-primary min-w-[130px] px-4 py-2">
									{selections[index]?.display}
								</DropdownMenuTrigger>
								<DropdownMenuContent className="text-primary bg-white">
									{menu.options.map((option, idx) => (
										<DropdownMenuItem
											key={idx}
											className="text-primary"
											onClick={() => updateSelection(index, option)}
											disabled={Boolean(
												option.disableIfFileNameIncludes &&
												fileName.includes(option.disableIfFileNameIncludes),
											)}
										>
											{option.display}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					))}
				</div>
				<div className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-hidden">
					{imgError && (
						<>
							<p className="text-red font-bold">
								Simulation noch nicht verfügbar
							</p>
						</>
					)}
					{fileName && !imgError && (
						<Image
							src={fileName}
							alt={imageAlt}
							className="h-full max-h-[100%] w-full object-contain"
							onError={() => {
								setImageError(true);
							}}
							loading="lazy"
							width={1600}
							height={900}
							unoptimized
						/>
					)}
				</div>
			</div>
		</div>
	);
}
