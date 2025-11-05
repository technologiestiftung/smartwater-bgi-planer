/**
 * Sanitizes address input to allow only characters typically found in addresses
 * @param input The raw user input string
 * @param strict If true, only allows alphanumeric characters and spaces
 * @returns Sanitized string with only allowed characters
 */
export const sanitizeAddressInput = (input: string, strict = false): string => {
	if (!input) return "";

	if (strict) {
		return input.replace(/[^a-zA-Z0-9\s]/g, "");
	}
	return input.replace(/[^a-zA-Z0-9\u00C0-\u017F\s,.'\-/#&()\u00B0+]/g, "");
};
