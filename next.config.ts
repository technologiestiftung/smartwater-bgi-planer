import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "gdi.berlin.de",
			},
			{
				protocol: "https",
				hostname: "smartwater-bgi-planer.netlify.app/",
			},
			{
				protocol: "https",
				hostname: "*smartwater-bgi-planer.netlify.app/",
			},
		],
	},
	turbopack: {},
	webpack(config) {
		const fileLoaderRule = config.module.rules.find((rule: any) =>
			rule.test?.test?.(".svg"),
		);
		config.module.rules.push(
			{
				test: /\.svg$/i,
				resourceQuery: /raw/,
				type: "asset/source",
			},
			{
				...fileLoaderRule,
				test: /\.svg$/i,
				resourceQuery: /url/,
			},
			{
				test: /\.svg$/i,
				issuer: fileLoaderRule.issuer,
				resourceQuery: { not: [/raw/, /url/] },
				use: ["@svgr/webpack"],
			},
		);
		fileLoaderRule.exclude = /\.svg$/i;
		return config;
	},
	devIndicators: false,
};

export default nextConfig;
