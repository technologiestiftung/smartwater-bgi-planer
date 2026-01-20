export function checkForQuestion(string: string, shouldInclude = false) {
	const questionRegex = /^(.*?)(_starter_question|_module_introduction|2V1)$/;
	if (shouldInclude) {
		return questionRegex.test(string);
	}
	return !questionRegex.test(string);
}
