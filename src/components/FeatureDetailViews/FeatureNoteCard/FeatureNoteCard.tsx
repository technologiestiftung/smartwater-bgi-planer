"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMapStore } from "@/store/map";
import { CheckIcon, TrashIcon, XCircleIcon } from "@phosphor-icons/react";
import type Feature from "ol/Feature";
import type { Geometry } from "ol/geom";
import { FC, useEffect, useState } from "react";

interface FeatureNoteCardProps {
	layerId?: string;
	features?: Feature<Geometry>;
	onClose?: () => void;
}

const getFeatureData = (feature: Feature) => {
	const properties = feature.getProperties();

	if (properties.features && properties.features.length > 0) {
		return properties.features[0].values_;
	}

	return properties;
};

export const FeatureNoteCard: FC<FeatureNoteCardProps> = ({
	layerId,
	features,
	onClose,
}) => {
	const [featureProperties, setFeatureProperties] = useState<any>(null);
	const [note, setNote] = useState("");
	const map = useMapStore((state) => state.map);

	useEffect(() => {
		if (!features) {
			const resetNote = () => {
				setFeatureProperties(null);
				setNote("");
			};
			resetNote();
			return;
		}

		const setNoteData = () => {
			const props = getFeatureData(features);
			setFeatureProperties(props);
			setNote(features.get("note") || "");
		};
		setNoteData();
	}, [features]);

	const handleSave = () => {
		if (!features) return;

		features.set("note", note);
		onClose?.();
	};

	const handleDelete = () => {
		if (!features || !map || !layerId) return;

		const layer = map.getAllLayers().find((l) => l.get("id") === layerId);

		if (layer && layer.getSource()) {
			const source = (layer as any).getSource();
			source?.removeFeature(features);
			setFeatureProperties(null);
			setNote("");

			onClose?.();
		}
	};

	if (!featureProperties) return null;

	return (
		<div className="NoteCard-root bg-background w-[325px] shadow-lg">
			<div className="border-muted flex h-8 w-full items-center justify-between border-b pl-2">
				<h3 className="text-sm font-semibold">Notiz einfügen</h3>
				<div className="bg-secondary h-8 w-8 text-white">
					<button
						className="flex h-full w-full items-center justify-center"
						onClick={onClose}
					>
						<XCircleIcon />
					</button>
				</div>
			</div>
			<div className="p-2">
				<Textarea
					value={note}
					onChange={(e) => setNote(e.target.value)}
					placeholder="Dieses Gebäude wird nächstes Jahr unter Denkmalschutz stehen..."
					className="mb-4 min-h-30 resize-none"
					rows={5}
				/>
				<div className="flex w-full gap-2">
					<Button className="flex-1" onClick={handleSave}>
						<CheckIcon />
						Speichern
					</Button>
					<Button className="flex-1" variant="outline" onClick={handleDelete}>
						<TrashIcon />
						Löschen
					</Button>
				</div>
			</div>
		</div>
	);
};
