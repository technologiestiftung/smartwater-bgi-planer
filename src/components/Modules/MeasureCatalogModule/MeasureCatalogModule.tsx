"use client";

import { FC } from "react";
import { useSearchParams } from "next/navigation";
import { getModuleStep, getModuleStepMeasure } from "../shared/moduleConfig";
import { ModuleMeasurementConfig, ModuleStepConfig } from "@/types/shared";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";
import { CarouselWithIndicators } from "@/components/ui/carousel-with-indicators";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MeasureCatalogScore } from "./MeasureCatalogScore";

interface MeasureCatalogModuleProps {
	info: string;
	onActivate: (stepId: string, configId: string) => void;
}

const MeasureCatalogModule: FC<MeasureCatalogModuleProps> = ({
	info,
	onActivate,
}) => {
	const getModuleInfo = getModuleStepMeasure(
		"measurePlanning",
		info,
	) as ModuleMeasurementConfig;
	const searchParams = useSearchParams();
	const {
		id,
		title,
		info: {
			description,
			images,
			scores,
			effects,
			planningNotes,
			policiesGuidelines,
			floodRiskLayerConfigId,
			floodRiskChartFolderSlug,
		} = {},
	} = getModuleInfo || {};
	const router = useRouter();

	const getStep = getModuleStep("measurePlanning", info) as ModuleStepConfig;

	return (
		<div className="MeasureCatalogModule-root">
			<div className="border-muted flex items-center justify-between gap-2 border-b px-6 py-4">
				<h2 className="text-primary">{title}</h2>
				<div className="flex gap-2.5">
					<Button
						variant="outline"
						onClick={() => router.push(`?climateSimulation=${id}`)}
					>
						Modellierung Stadtklima
					</Button>
					<Button
						variant="outline"
						onClick={() => router.push(`?floodRisk=${id}`)}
						disabled={!floodRiskLayerConfigId && !floodRiskChartFolderSlug}
					>
						Modellierung Überflutungsgefährdung
					</Button>
					<Button
						onClick={() => {
							const params = new URLSearchParams(searchParams.toString());
							params.delete("climateSimulation");
							params.delete("floodRisk");
							params.delete("info");
							router.replace(`?${params.toString()}`);
							onActivate(getStep.id, info);
						}}
					>
						<PlusIcon /> Hinzufügen
					</Button>
				</div>
			</div>
			<div className="flex">
				<div className="flex max-h-[70vh] min-w-0 flex-1 flex-col gap-4 overflow-y-scroll p-6 pr-4">
					{description && Array.isArray(description) ? (
						<div>
							{description.map((desc, index) => (
								<p key={index} className="wrap-break-word">
									{desc}
								</p>
							))}
						</div>
					) : (
						<p className="wrap-break-word">{description}</p>
					)}
					<MeasureCatalogScore scores={scores} />
					{images && (
						<CarouselWithIndicators
							hideTitle
							fullWidthSlider
							narrow
							dark
							slides={images}
						/>
					)}
				</div>
				<div className="border-muted border-l" />
				<div className="flex max-h-[70vh] min-w-0 flex-1 flex-col gap-6 overflow-y-scroll p-6 pl-4">
					<div>
						<h4>Effekte & Vorteile:</h4>
						{effects && (
							<ul className="mt-4 list-inside list-disc">
								{effects.map((effect, index) => (
									<li key={index}>{effect}</li>
								))}
							</ul>
						)}
					</div>
					<div>
						<h4>Planungshinweise:</h4>
						{planningNotes && (
							<div className="mt-4">
								{planningNotes.map((note, index) => (
									<div key={index} className="mb-2">
										<p className="font-semibold">{note.title}</p>
										<ul className="list-inside list-disc">
											{note.notes.map((noteItem, noteIndex) => (
												<li key={noteIndex}>{noteItem}</li>
											))}
										</ul>
									</div>
								))}
							</div>
						)}
					</div>
					<div>
						<h4>Richtlinien und Leitfäden:</h4>
						{policiesGuidelines && (
							<div className="mt-4">
								<ul className="list-inside list-disc">
									{policiesGuidelines.map(
										(policiesGuidelinesItem, noteIndex) => (
											<li key={noteIndex}>
												<Link
													href={policiesGuidelinesItem.link}
													target="_blank"
													rel="noopener noreferrer"
													className="underline"
												>
													{policiesGuidelinesItem.title}
												</Link>
											</li>
										),
									)}
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MeasureCatalogModule;
