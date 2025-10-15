import type { Metadata } from "next";
import "./css/globals.css";
import localFont from "next/font/local";

const arthouseOwned = localFont({
	src: [
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
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="de">
			<body className={arthouseOwned.variable}>{children}</body>
		</html>
	);
}
