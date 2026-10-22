export const createEntityId = (prefix: string) =>
	`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/** German number formatting: decimal comma, dot as thousands separator. */
export const formatNumber = (
	value: number,
	maximumFractionDigits = 2,
	minimumFractionDigits = 0,
) =>
	value.toLocaleString("de-DE", {
		minimumFractionDigits,
		maximumFractionDigits,
	});
