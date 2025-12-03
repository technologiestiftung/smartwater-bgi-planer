import { feasibilitySteps } from "@/components/Modules/FeasibilityModule/constants";
import { measurePlaningSteps } from "@/components/Modules/MeasurePlaningModule/constants";
import { needForActionSteps } from "@/components/Modules/NeedForActionModule/constants";

export function getSectionIds() {
	return [
		...needForActionSteps,
		...feasibilitySteps,
		...measurePlaningSteps,
	].map((step) => step.id);
}

export const allSectionIds = getSectionIds();
export type SectionId = (typeof allSectionIds)[number];
