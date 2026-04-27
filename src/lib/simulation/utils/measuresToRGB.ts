/**
 * Calculates RGB color based on input measures.
 * @param {number} measure1 - The first measure value.
 * @param {number} measure2 - The second measure value.
 * @param {number} measure3 - The third measure value.
 * @return {string} RGB color value in the format 'rgb(red,green,blue)'.
 */
export const measuresToRGB = (
	measure1: number,
	measure2: number,
	measure3: number,
): string => {
	const red: number = Math.round((measure1 / 100) * 255),
		green: number = Math.round((measure2 / 100) * 255),
		blue: number = Math.round((measure3 / 100) * 255);

	return `rgb(${red},${green},${blue})`;
};
