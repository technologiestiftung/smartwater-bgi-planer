"use client";
import { Button } from "@/components/ui/button";
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
import { UploadIcon } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { UseCase } from "@/store/projects/types";

export interface ProjectFormData {
	name: string;
	description: string;
	useCase: UseCase;
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
		useCase: initialData?.useCase || UseCase.Individual,
	});

	useEffect(() => {
		if (onFormChange) {
			onFormChange(formData);
		}
	}, [formData, onFormChange]);

	const handleFieldChange = (
		field: keyof ProjectFormData,
		value: string | UseCase,
	) => {
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
						placeholder="Projektname eingeben..."
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
						onValueChange={(value) =>
							handleFieldChange("useCase", value as UseCase)
						}
					>
						<div className="flex items-center gap-3">
							<RadioGroupItem value={UseCase.Individual} id="r1" />
							<p>individuelles Gebiet</p>
						</div>
						<div className="flex items-center gap-3">
							<RadioGroupItem value={UseCase.District} id="r2" />
							<p>Quartier</p>
						</div>
						<div className="flex items-center gap-3">
							<RadioGroupItem value={UseCase.Property} id="r3" />
							<p>Grundstück</p>
						</div>
						<div className="flex items-center gap-3">
							<RadioGroupItem value={UseCase.PublicSpace} id="r4" />
							<p>Straßen, Wege, Plätze / Grün- und Freiflächen</p>
						</div>
					</RadioGroup>
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
