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
	devIndicators: false,
};

export default nextConfig;
