"use client";

import { FC } from "react";

const MapFooter: FC = () => {
	return (
		<div className="absolute right-0 bottom-0 z-9 flex items-center gap-2 bg-white/60 px-4 select-none">
			<p className="text-xs">
				<span className="font-bold">Quelle: </span>
				<a href="https://basemap.de/" target="_blank" rel="noopener noreferrer">
					<span className="hover:text-accent underline">basemap.de</span>
				</a>
			</p>
			<span>|</span>
			<a
				href="https://www.technologiestiftung-berlin.de/impressum/"
				target="_blank"
				rel="noopener noreferrer"
			>
				<p className="hover:text-accent text-xs font-bold">Impressum</p>
			</a>
			<span>|</span>
			<p className="text-xs">
				<span className="font-bold">Kartenquelle: </span>
				<a
					href="https://gdi.berlin.de/viewer/main/"
					target="_blank"
					rel="noopener noreferrer"
				>
					<span className="hover:text-accent underline">Geoportal Berlin</span>
				</a>
			</p>
		</div>
	);
};

export default MapFooter;
