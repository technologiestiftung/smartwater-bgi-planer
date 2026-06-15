import type { MeasureConfig } from "@/types/measures";

export const createMeasureConfigMap = (configs: MeasureConfig[]) =>
	new Map(configs.map((config) => [config.id, config] as const));
