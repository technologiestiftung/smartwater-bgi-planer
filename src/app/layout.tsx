import MapInitializer from "@/components/Map/MapInitializer/MapInitializer";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./css/globals.css";
import Background from "@/images/background.svg";

const arthouseOwned = localFont({
	src: [
		{
			path: "../../public/fonts/ArthouseOwnedLight.ttf",
			weight: "300",
			style: "normal",
		},
		{
			path: "../../public/fonts/ArthouseOwnedRegular.ttf",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/fonts/ArthouseOwnedMedium.ttf",
			weight: "500",
			style: "normal",
		},
		{
			path: "../../public/fonts/ArthouseOwnedMediumItalic.ttf",
			weight: "500",
			style: "italic",
		},
		{
			path: "../../public/fonts/ArthouseOwnedBold.ttf",
			weight: "700",
			style: "normal",
		},
		{
			path: "../../public/fonts/ArthouseOwnedBoldItalic.ttf",
			weight: "700",
			style: "italic",
		},
	],
	variable: "--font-arthouse-owned",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Smartwater BGI Planer",
	description: "Technische Umsetzung von der Technologiestiftung Berlin",
};

export default function RootLayout({
	children,
	modal,
}: Readonly<{
	children: React.ReactNode;
	modal: React.ReactNode;
}>) {
	return (
		<html lang="de">
			<body className={arthouseOwned.variable}>
				<div className="relative h-full w-full">
					<div className="absolute h-full w-full">
						<MapInitializer />
						{children}
						{modal}
					</div>
					<div className="bg-primary absolute -z-99 flex h-full w-full items-center justify-center overflow-hidden">
						<Background className="min-h-full min-w-full flex-shrink-0" />
					</div>
				</div>
			</body>
		</html>
	);
}
