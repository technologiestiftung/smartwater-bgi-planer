import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function checkForQuestion(string: string, shouldInclude = false) {
	const questionRegex = /^(.*?)(_starter_question|_module_introduction)$/;
	if (shouldInclude) {
		return questionRegex.test(string);
	}
	return !questionRegex.test(string);
}
