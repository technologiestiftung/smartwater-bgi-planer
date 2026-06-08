import measuresConfigJson from "@/config/measuresConfig.json";
import type { MeasureConfig } from "@/types/measures";

export const measuresConfig = measuresConfigJson as MeasureConfig[];

export const measureConfigById = new Map(
	measuresConfig.map((item) => [item.id, item] as const),
);

export const getMeasureConfigById = (configId: string) =>
	measureConfigById.get(configId);
