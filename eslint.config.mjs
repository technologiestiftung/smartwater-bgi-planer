import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import { technologiestiftungRules } from "./eslintRules.mjs";

const eslintConfig = [
	{
		ignores: [
			"node_modules/**",
			".next/**",
			"out/**",
			"build/**",
			"next-env.d.ts",
		],
	},
	...nextCoreWebVitals,
	technologiestiftungRules,
];

export default eslintConfig;
