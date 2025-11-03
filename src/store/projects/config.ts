export type ProjectMode = "multi" | "single";

// Read project mode from environment variable
export const getProjectMode = (): ProjectMode => {
	const envMode = process.env.NEXT_PUBLIC_PROJECT_MODE;
	return envMode === "single" ? "single" : "multi";
};

export const PROJECT_MODE = getProjectMode();
