"use client";

import { Input } from "@/components/ui/input";
import { searchAddresses } from "@/lib/serverActions/searchAddresses";
import { useMapStore } from "@/store";
import { transform } from "ol/proj";
import { boundingExtent } from "ol/extent";
import { useState, useRef, useCallback, useEffect } from "react";
import {
	ArrowRightIcon,
	MagnifyingGlassIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { AddressFeature } from "@/types";
import { sanitizeAddressInput } from "@/lib/utils/sanitizerUtils";
import { usePathname } from "next/navigation";

const ANIMATION_DURATION = 1000;

export function AddressSearch() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<AddressFeature[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const { map } = useMapStore();
	const inputRef = useRef<HTMLInputElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);
	const pathname = usePathname();
	const isProjectStarter = pathname.includes("/project-starter");

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				resultsRef.current &&
				!resultsRef.current.contains(event.target as Node) &&
				!inputRef.current?.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const performSearch = useCallback(async (searchQuery: string) => {
		if (searchQuery.trim().length < 2) {
			setResults([]);
			setIsOpen(false);
			return;
		}

		setIsLoading(true);
		try {
			const searchResults = await searchAddresses(searchQuery);
			setResults(searchResults);
			setIsOpen(searchResults.length > 0);
			setSelectedIndex(-1);
		} catch (error) {
			console.error("Search error:", error);
			setResults([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = sanitizeAddressInput(e.target.value);
		setQuery(value);

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			performSearch(value);
		}, 300);
	};

	const handleSelectAddress = useCallback(
		(result: AddressFeature) => {
			if (!map) return;

			const [lng, lat] = result.geometry.coordinates;
			const mapProjection = map.getView().getProjection().getCode();

			if (result.bbox && result.bbox.length === 4) {
				const [minLng, minLat, maxLng, maxLat] = result.bbox;
				const bottomLeft = transform(
					[minLng, minLat],
					"EPSG:4326",
					mapProjection,
				);
				const topRight = transform(
					[maxLng, maxLat],
					"EPSG:4326",
					mapProjection,
				);
				const extent = boundingExtent([bottomLeft, topRight]);

				map.getView().fit(extent, {
					duration: ANIMATION_DURATION,
					padding: [50, 50, 50, 50],
				});
			} else {
				const transformedCoords = transform(
					[lng, lat],
					"EPSG:4326",
					mapProjection,
				);
				map.getView().animate({
					center: transformedCoords,
					duration: ANIMATION_DURATION,
					zoom: 16,
				});
			}

			setQuery(result.properties.name);
			setIsOpen(false);
			setResults([]);
		},
		[map],
	);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!isOpen || results.length === 0) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex((prev) =>
					prev < results.length - 1 ? prev + 1 : prev,
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
				break;
			case "Enter":
				e.preventDefault();
				if (selectedIndex >= 0 && results[selectedIndex]) {
					handleSelectAddress(results[selectedIndex]);
				}
				break;
			case "Escape":
				e.preventDefault();
				setIsOpen(false);
				setSelectedIndex(-1);
				break;
			default:
				break;
		}
	};

	return (
		isProjectStarter && (
			<div className="text-primary absolute top-4 z-50 w-[calc(100%-15rem)] px-4">
				<div className="relative">
					<MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-6 -translate-y-1/2" />
					<Input
						ref={inputRef}
						placeholder="Search for an address..."
						value={query}
						className="bg-background min-h-12 w-full border-none pr-12 pl-12"
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						onFocus={() => {
							if (results.length > 0) setIsOpen(true);
						}}
						role="combobox"
						aria-expanded={isOpen}
						aria-controls="address-search-results"
						aria-activedescendant={
							selectedIndex >= 0 ? `address-option-${selectedIndex}` : undefined
						}
						aria-autocomplete="list"
					/>
					{isLoading ? (
						<div className="absolute top-1/2 right-3 -translate-y-1/2">
							<div className="border-primary border-t-secondary h-5 w-5 animate-spin rounded-full border-2" />
						</div>
					) : (
						query && (
							<button
								onClick={() => {
									setQuery("");
									setResults([]);
									setIsOpen(false);
									inputRef.current?.focus();
								}}
								className="absolute top-1/2 right-2.5 -translate-y-1/2 transition-opacity hover:opacity-70"
								aria-label="Clear search"
							>
								<XCircleIcon className="size-6" />
							</button>
						)
					)}
				</div>

				{isOpen && results.length > 0 && (
					<div
						ref={resultsRef}
						id="address-search-results"
						className="bg-background"
						role="listbox"
						aria-label="Search results"
					>
						{results.map((result, index) => (
							<div
								key={`${result.properties.osm_type}-${result.properties.osm_id}-${index}`}
								id={`address-option-${index}`}
								onClick={() => handleSelectAddress(result)}
								onMouseEnter={() => setSelectedIndex(index)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										handleSelectAddress(result);
									}
								}}
								tabIndex={-1}
								className={`flex cursor-pointer items-center gap-2 px-4 py-3 transition-colors ${
									index === selectedIndex
										? "bg-secondary/50"
										: "hover:bg-secondary/20"
								}`}
								role="option"
								aria-selected={index === selectedIndex}
							>
								<div className="font-medium">{result.properties.name}</div>
								{(result.properties.district ||
									result.properties.postcode ||
									result.properties.type) && (
									<div>
										{[result.properties.district, result.properties.postcode]
											.filter(Boolean)
											.join(" ")}
									</div>
								)}
								<ArrowRightIcon className="ml-auto size-6" />
							</div>
						))}
					</div>
				)}
			</div>
		)
	);
}
