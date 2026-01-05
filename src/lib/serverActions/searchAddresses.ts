"use server";

import { sanitizeAddressInput } from "@/lib/helpers/sanitizer";
import { AddressFeature } from "@/types";

const DEFAULT_LAT = "52.5";
const DEFAULT_LON = "13.4";

interface PhotonProperties {
	osm_type?: string;
	osm_id?: number;
	osm_key?: string;
	osm_value?: string;
	name?: string;
	street?: string;
	housenumber?: string;
	postcode?: string;
	city?: string;
	district?: string;
	county?: string;
	state?: string;
	country?: string;
	countrycode?: string;
	extent?: number[];
}

interface PhotonFeature {
	type: "Feature";
	properties: PhotonProperties;
	geometry: {
		type: "Point";
		coordinates: [number, number];
	};
}

interface PhotonResponse {
	type: "FeatureCollection";
	features: PhotonFeature[];
}

export async function searchAddresses(
	query: string,
): Promise<AddressFeature[]> {
	const sanitizedQuery = sanitizeAddressInput(query);

	if (sanitizedQuery.trim().length < 2) {
		return [];
	}

	try {
		const bboxString = process.env.MAP_BOUNDING_BOX;
		const filterCountry = process.env.SEARCH_FILTER_COUNTRY || "DE";
		const filterCity = process.env.SEARCH_FILTER_CITY || "Berlin";

		let parsedBbox: number[] | null = null;

		if (bboxString) {
			const bboxArray = bboxString.split(",").map(Number);
			if (
				bboxArray.length === 4 &&
				bboxArray.every((val) => !isNaN(val) && isFinite(val))
			) {
				parsedBbox = bboxArray;
			} else {
				console.warn(
					`Invalid MAP_BOUNDING_BOX format: "${bboxString}". Expected 4 comma-separated numbers.`,
				);
			}
		}

		const params = new URLSearchParams({
			q: sanitizedQuery,
			limit: "20",
			lang: "de",
		});

		if (parsedBbox) {
			const [minLon, minLat, maxLon, maxLat] = parsedBbox;
			const centerLon = ((minLon + maxLon) / 2).toString();
			const centerLat = ((minLat + maxLat) / 2).toString();
			params.append("lat", centerLat);
			params.append("lon", centerLon);
		} else {
			params.append("lat", DEFAULT_LAT);
			params.append("lon", DEFAULT_LON);
		}

		const url = `https://photon.komoot.io/api/?${params.toString()}`;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		let response: Response;
		try {
			response = await fetch(url, { signal: controller.signal });
			clearTimeout(timeoutId);

			if (!response.ok) {
				console.warn(`Address search failed with status: ${response.status}`);
				return [];
			}
		} catch (fetchError) {
			clearTimeout(timeoutId);
			if (fetchError instanceof Error && fetchError.name === "AbortError") {
				console.warn("Address search request timed out");
			} else {
				console.warn("Address search fetch error:", fetchError);
			}
			return [];
		}

		const data: PhotonResponse = await response.json();

		const filteredFeatures = data.features.filter((feature) => {
			const props = feature.properties;
			if (
				filterCountry &&
				props.countrycode?.toUpperCase() !== filterCountry.toUpperCase()
			)
				return false;

			if (filterCity) {
				const isInCity =
					props.city === filterCity || props.state?.includes(filterCity);

				if (!isInCity) {
					if (parsedBbox) {
						const [minLon, minLat, maxLon, maxLat] = parsedBbox;
						const [lon, lat] = feature.geometry.coordinates;
						if (lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) {
							return false;
						}
					} else {
						return false;
					}
				}
			}
			const excludeTypes = ["city", "country", "state"];
			if (excludeTypes.includes(props.osm_value || "")) return false;

			return true;
		});

		return filteredFeatures.slice(0, 10).map((feature) => {
			const props = feature.properties;

			let displayName = props.name || "";
			if (props.street) {
				displayName = props.street;
				if (props.housenumber) {
					displayName += ` ${props.housenumber}`;
				}
			}
			if (props.city && displayName !== props.city) {
				displayName += displayName ? `, ${props.city}` : props.city;
			}
			if (!displayName) {
				displayName = props.city || props.district || props.county || "Unknown";
			}

			return {
				type: "Feature" as const,
				properties: {
					name: displayName,
					street: props.street,
					city: props.city,
					district: props.district,
					postcode: props.postcode,
					osm_type: props.osm_type,
					osm_id: props.osm_id,
					type: props.osm_value,
				},
				geometry: {
					type: "Point" as const,
					coordinates: feature.geometry.coordinates,
				},
				bbox:
					props.extent && props.extent.length === 4
						? [
								props.extent[0],
								props.extent[1],
								props.extent[2],
								props.extent[3],
							]
						: undefined,
			};
		});
	} catch (error) {
		console.warn("Address search error:", error);
		return [];
	}
}
