"use client";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { UseCase } from "@/store/projects/types";
import { useEffect, useState } from "react";
import { Checkbox } from "../ui/checkbox";

export interface ProjectFormData {
	name: string;
	description: string;
	useCase: UseCase;
	hideTutorials: boolean;
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
		hideTutorials: initialData?.hideTutorials ?? false,
	});

	useEffect(() => {
		if (onFormChange) {
			onFormChange(formData);
		}
	}, [formData, onFormChange]);

	const handleFieldChange = (
		field: keyof ProjectFormData,
		value: string | UseCase | boolean,
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

				<Field orientation="horizontal">
					<div className="flex w-full items-center justify-center gap-3">
						<Checkbox
							id="hide-tutorials"
							checked={formData.hideTutorials}
							onCheckedChange={(checked) =>
								handleFieldChange("hideTutorials", checked)
							}
						/>

						<label
							htmlFor="hide-tutorials"
							className="cursor-pointer text-sm font-light italic select-none"
						>
							Tutorials und Hilfestellungen ausblenden
						</label>
					</div>
				</Field>
			</FieldGroup>
		</FieldSet>
	);
}
