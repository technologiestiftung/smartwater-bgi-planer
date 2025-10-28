/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FC, useEffect, useState } from "react";

interface NoteCardProps {
	features?: any;
}

const getFeatureData = (feature: any) => {
	const properties = feature.getProperties();

	if (properties.features && properties.features.length > 0) {
		return properties.features[0].values_;
	}

	return properties;
};

const NoteCard: FC<NoteCardProps> = ({ features }) => {
	const [featureProperties, setFeatureProperties] = useState<any>(null);
	const [note, setNote] = useState("");

	useEffect(() => {
		if (!features) {
			setFeatureProperties(null);
			setNote("");
			return;
		}

		const props = getFeatureData(features);
		setFeatureProperties(props);
		setNote(features.get("note") || "");
	}, [features]);

	const handleSave = () => {
		if (!features) return;

		features.set("note", note);
		console.log("Note saved:", note);
	};

	if (!featureProperties) return null;

	return (
		<div className="NoteCard-root bg-white rounded-lg shadow-lg w-[400px]">
			<div className="flex items-center justify-between p-4 border-b">
				<h3 className="font-semibold text-lg">Notiz einfügen</h3>
				<button className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="15" y1="9" x2="9" y2="15" />
						<line x1="9" y1="9" x2="15" y2="15" />
					</svg>
				</button>
			</div>
			<div className="p-4">
				<Textarea
					value={note}
					onChange={(e) => setNote(e.target.value)}
					placeholder="This building will be under Denkmalschutz next year ..."
					className="mb-4 min-h-[120px] resize-none border-gray-200"
					rows={5}
				/>
				<div className="flex gap-2">
					<Button
						onClick={handleSave}
						className="flex-1 bg-teal-800 hover:bg-teal-900 text-white"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="mr-2"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						Speichern
					</Button>
					<Button
						variant="outline"
						className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="mr-2"
						>
							<polyline points="3 6 5 6 21 6" />
							<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
						</svg>
						Löschen
					</Button>
				</div>
			</div>
		</div>
	);
};

export default NoteCard;
