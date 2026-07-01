"use client";

import { ModuleMeasurementConfig } from "@/types/shared";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getModuleStepMeasure } from "../Modules/shared/moduleConfig";
import dropdownMenus from "./dropDownMenus.json";

interface ClimateSimulationModalProps {
	climateSimulation: string;
}

type DropdownSelection = {
	display: string;
	value: string;
};

export function ClimateSimulationModal({
	climateSimulation,
}: ClimateSimulationModalProps) {
	const getModuleInfo = getModuleStepMeasure(
		"measurePlanning",
		climateSimulation,
	) as ModuleMeasurementConfig;
	const { climateSimulation: { title } = {} } = getModuleInfo || {};
	const fileType = ".webp";
	const [imgError, setImageError] = useState(false);
	const [selections, setSelections] = useState<DropdownSelection[]>(
		() =>
			dropdownMenus?.map((m) => {
				const first = m.options[0];
				return {
					display: first.display,
					value: first.value || first.display,
				};
			}) || [],
	);
	const fileName = `/images/climateSimulation/${title}_${selections
		.map((s) => sanitizeString(s.value || s.display))
		.join("_")}${fileType}`;

	function sanitizeString(input: string) {
		return input.replace(/[%:]/g, "");
	}

	const updateSelection = (
		menuIndex: number,
		option: { display: string; value?: string },
	) => {
		setSelections((prev) => {
			const next = [...prev];
			next[menuIndex] = {
				display: option.display,
				value: option.value || option.display,
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

	return (
		<div className="ClimateSimulation-Overlay fixed inset-0 z-40 ml-136 flex items-center justify-start bg-black/60 p-2 backdrop-blur-sm">
			<div className="flex h-full w-full max-w-6xl flex-col gap-4 bg-white p-6">
				<div className="flex items-end justify-between gap-2">
					{dropdownMenus.map((menu, index) => (
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
										>
											{option.display}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					))}
				</div>
				<div className="flex flex-col items-center gap-2">
					{imgError && (
						<>
							<p className="text-red font-bold">Fehler beim Laden des Bildes</p>
							<p>Dateienpfad: {fileName}</p>
						</>
					)}
					{fileName && !imgError && (
						<Image
							src={fileName}
							alt={fileName}
							className="h-full max-h-[80%] w-full object-contain"
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
