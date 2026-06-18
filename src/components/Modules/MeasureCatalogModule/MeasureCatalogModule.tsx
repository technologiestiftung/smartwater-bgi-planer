import { FC } from "react";
import { getModuleStepMeasure } from "../shared/moduleConfig";
import { ModuleMeasurementConfig } from "@/types/shared";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";
import { getIconComponent } from "@/lib/helpers/iconMap";
import { cn } from "@/lib/utils";
import { CarouselWithIndicators } from "@/components/ui/carousel-with-indicators";
import { useRouter } from "next/navigation";

interface MeasureCatalogModuleProps {
	info: string;
}

const MeasureCatalogModule: FC<MeasureCatalogModuleProps> = ({ info }) => {
	const getModuleInfo = getModuleStepMeasure(
		"measurePlanning",
		info,
	) as ModuleMeasurementConfig;
	const {
		id,
		title,
		info: { description, images, scores, effects, planningNotes } = {},
	} = getModuleInfo || {};
	const router = useRouter();
	return (
		<div className="MeasureCatalogModule-root">
			<div className="border-muted flex items-center justify-between border-b px-6 py-4">
				<h2 className="text-primary">{title}</h2>
				<div className="flex gap-2.5">
					<Button
						variant="outline"
						onClick={() => router.push(`?cityClimateSimulation=${id}`)}
					>
						Modellierung Stadtklima
					</Button>
					<Button variant="outline" disabled>
						Modellierung Überflutungsgefährdung
					</Button>
					<Button disabled>
						<PlusIcon /> Hinzufügen
					</Button>
				</div>
			</div>
			<div className="flex">
				<div className="flex min-w-0 flex-1 flex-col gap-4 p-6 pr-4">
					<p>{description}</p>
					<div className="flex flex-wrap justify-start gap-2">
						{scores &&
							Object.keys(scores).map((iconName) => {
								const MetricIcon = getIconComponent(iconName);
								const maxScore = 3;
								const label: Record<string, string> = {
									CloudRain: "Starkregen",
									ThermometerHot: "Stadtklima",
									Drop: "Gewässerschutz",
								};
								const score = getModuleInfo.info?.scores?.[iconName] ?? 0;
								return (
									<div
										key={`${id}-${iconName}`}
										className="flex items-center gap-1"
									>
										{Array.from({ length: maxScore }, (_, i) => (
											<span
												key={`${id}-${iconName}-${i}`}
												className={cn(
													"bg-neutral-mid border-neutral-mid inline-flex h-6 w-6 items-center justify-center rounded-full border",
													score > i && "bg-primary border-primary",
												)}
											>
												<MetricIcon className="h-4 w-4 text-white" />
											</span>
										))}
										<p>{label[iconName]}</p>
									</div>
								);
							})}
					</div>
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
						<p className="font-bold">Effekte & Vorteile:</p>
						{effects && (
							<ul className="list-inside list-disc">
								{effects.map((effect, index) => (
									<li key={index}>{effect}</li>
								))}
							</ul>
						)}
					</div>
					<div>
						<p className="font-bold">Planungshinweise:</p>
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
				</div>
			</div>
		</div>
	);
};

export default MeasureCatalogModule;
