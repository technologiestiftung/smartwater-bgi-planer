"use client";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";
import { PenNibIcon, PolygonIcon, UploadIcon } from "@phosphor-icons/react";
import { useState, useEffect } from "react";

export interface ProjectFormData {
	name: string;
	description: string;
	useCase: string;
}

interface ProjectModalProps {
	mode?: "new" | "edit";
	projectId?: string;
	onFormChange?: (data: ProjectFormData) => void;
	initialData?: ProjectFormData;
}

export default function ProjectModalContent({
	onFormChange,
	initialData,
}: ProjectModalProps) {
	const [formData, setFormData] = useState<ProjectFormData>({
		name: initialData?.name || "",
		description: initialData?.description || "",
		useCase: initialData?.useCase || "individual",
	});

	useEffect(() => {
		if (onFormChange) {
			onFormChange(formData);
		}
	}, [formData, onFormChange]);

	const handleFieldChange = (field: keyof ProjectFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};
	return (
		<FieldSet>
			<FieldGroup>
				<Field orientation="horizontal">
					<FieldLabel htmlFor="name" className="min-w-48">
						Projektname
					</FieldLabel>
					<Input
						id="name"
						autoComplete="off"
						required
						placeholder="Evil Rabbit"
						value={formData.name}
						onChange={(e) => handleFieldChange("name", e.target.value)}
					/>
				</Field>
				<Field orientation="horizontal">
					<FieldLabel htmlFor="description" className="min-w-48">
						Projektbeschreibung
					</FieldLabel>
					<Textarea
						id="description"
						className="min-h-60"
						placeholder="Projektbeschreibung eingeben..."
						rows={8}
						value={formData.description}
						onChange={(e) => handleFieldChange("description", e.target.value)}
					/>
				</Field>
				<Field orientation="horizontal">
					<FieldLabel htmlFor="useCase" className="max-w-48">
						Anwendungsfall
					</FieldLabel>
					<RadioGroup
						id="useCase"
						required
						aria-label="Anwendungsfall"
						value={formData.useCase}
						onValueChange={(value) => handleFieldChange("useCase", value)}
					>
						<div className="flex items-center gap-3">
							<RadioGroupItem value="individual" id="r1" />
							<p>individuelles Gebiet</p>
						</div>
						<div className="flex items-center gap-3">
							<RadioGroupItem value="quarter" id="r2" />
							<p>Quartier</p>
						</div>
						<div className="flex items-center gap-3">
							<RadioGroupItem value="property" id="r3" />
							<p>Grundstück</p>
						</div>
						<div className="flex items-center gap-3">
							<RadioGroupItem value="public-spaces" id="r4" />
							<p>Straßen, Wege, Plätze / Grün- und Freiflächen</p>
						</div>
					</RadioGroup>
				</Field>
				<Field>
					<FieldLabel htmlFor="additionalNotes" className="min-w-48">
						Untersuchungsgebiet
					</FieldLabel>
					<FieldDescription>
						Zeichnen Sie hier die Außengrenze des Projektes.
					</FieldDescription>
					<div className="border-input bg-muted mt-2 h-60 w-full rounded-md border" />
					<div className="mt-2 flex justify-end gap-2">
						<Button>
							<PolygonIcon />
							Fläche zeichnen
						</Button>
						<Button>
							<UploadIcon />
							Shapefile hochladen
						</Button>
					</div>
				</Field>
				<Field>
					<FieldLabel htmlFor="additionalNotes" className="min-w-48">
						Neubauten & Versiegelte Flächen
					</FieldLabel>
					<FieldDescription>
						Markieren oder laden Sie Flächen hoch, die neue Gebäude oder
						versiegelte Oberflächen darstellen. Sie können die Flächen direkt in
						der Karte einzeichnen oder Shapefiles hochladen. Diese Informationen
						werden für die weitere Analyse Ihres Projekts berücksichtigt.{" "}
					</FieldDescription>
					<div className="border-input bg-muted mt-2 h-60 w-full rounded-md border" />
					<div className="mt-2 flex justify-end gap-2">
						<Button>
							<PolygonIcon />
							Fläche zeichnen
						</Button>
						<Button>
							<PenNibIcon />
							Bearbeiten
						</Button>
						<Button>
							<UploadIcon />
							Shapefile hochladen
						</Button>
					</div>
				</Field>
				<Field className="mt-4">
					<FieldDescription>
						Laden Sie hier eigene Karten hoch. Diese können als
						Referenzinformation für die Beantwortung der Checkfragen dienen.
						Sollten Ihnen, zum Beispiel, Karten über Altlasten, unterirdische
						Leitungen, oder geplante Bauvorhaben zur Verfügung stehen, sie
						können hier hochgeladen werden und jederzeit in der Bearbeitung des
						Projektes ein- und ausgeblendet werden. GeoTIFF Dateien und WMS
						Dienste werden unterstützt. Bearbeiten
					</FieldDescription>
					<div className="mt-2 flex justify-end gap-2">
						<Button>
							<UploadIcon />
							Weitere Karten hochladen
						</Button>
					</div>
				</Field>
			</FieldGroup>
		</FieldSet>
	);
}
