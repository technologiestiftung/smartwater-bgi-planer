declare module "*.css" {
	const content: Record<string, string>;
	export default content;
}

declare module "*.scss" {
	const content: Record<string, string>;
	export default content;
}

declare module "*.svg" {
	import React from "react";
	const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
	export default SVG;
}
