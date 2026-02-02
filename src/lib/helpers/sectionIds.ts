import { getModuleSteps } from "@/components/Modules/shared/moduleConfig";

export function getSectionIds() {
	const needForActionSteps = getModuleSteps("needForAction");
	const feasibilitySteps = getModuleSteps("feasibility");
	const measurePlaningSteps = getModuleSteps("measurePlaning");

	return [
		...needForActionSteps,
		...feasibilitySteps,
		...measurePlaningSteps,
	].map((step) => step.id);
}

export const allSectionIds = getSectionIds();
export type SectionId = (typeof allSectionIds)[number];
