"use client";

import { FileUploadZone } from "@/components/FileUpload/FileUploadZone";
import ProjectUploaderButton from "@/components/ProjectUploaderButton/ProjectUploaderButton";
import { Button } from "@/components/ui/button";
import { CarouselWithIndicators } from "@/components/ui/carousel-with-indicators";
import Funding from "@/logos/gdb_logo.svg";
import SmartWaterLogo from "@/logos/SmartWater-Logo.svg";
import SWLogo from "@/logos/SWLogo.svg";
import { useProjectsStore } from "@/store/projects";
import { useUiStore } from "@/store/ui";
import { GithubLogoIcon, PlusSquareIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
	const [showUploadAlert, setShowUploadAlert] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

	const router = useRouter();
	const { getProject, hasHydrated, getLastPath } = useProjectsStore();
	const uploadError = useUiStore((state) => state.uploadError);
	const clearUploadStatus = useUiStore((state) => state.clearUploadStatus);

	const handleNewProjectClick = () => {
		if (uploadError) {
			clearUploadStatus();
		}
		setUploadedFiles([]);
		setShowUploadAlert(false);
	};

	const handleToggleUpload = () => {
		if (uploadError) {
			clearUploadStatus();
			setUploadedFiles([]);
			setShowUploadAlert(false);
		} else {
			setShowUploadAlert(!showUploadAlert);
		}
	};

	useEffect(() => {
		if (!hasHydrated) return;

		const project = getProject();
		if (project) {
			router.replace(`/${project.id}`);
		}
	}, [hasHydrated, getProject, router]);

	return (
		<div className="relativ bg-background grid h-full w-full lg:grid-cols-2">
			<div className="flex h-full flex-col justify-start p-4 lg:justify-between lg:p-18">
				<div className="Logo-root flex flex-col gap-6">
					<SWLogo className="h-28 w-48 max-w-48" />
				</div>
				<div className="Welcome-root flex flex-col gap-6">
					<h1 className="">Herzlich willkommen beim BGI Planer</h1>
					<h2 className="lg:hidden">Mobile Version</h2>
					<p className="text-muted-foreground lg:hidden">
						Der BGI Planer ist nur für die Nutzung auf dem Desktop vorgesehen,
						damit alle Funktionen vollumfänglich genutzt werden können.
					</p>

					{showUploadAlert && (
						<FileUploadZone
							files={uploadedFiles}
							onFilesChange={(files: File[]) => setUploadedFiles(files)}
						/>
					)}

					<div className="hidden flex-wrap items-center justify-between gap-8 lg:flex">
						<Button asChild className="grow" onClick={handleNewProjectClick}>
							<Link href="/new">
								<PlusSquareIcon className="mr-2" />
								<p>Projekt anlegen</p>
							</Link>
						</Button>

						<ProjectUploaderButton
							isUploadZoneVisible={showUploadAlert}
							files={uploadedFiles}
							onToggle={handleToggleUpload}
							onComplete={(uploadedProject) => {
								setShowUploadAlert(false);
								setUploadedFiles([]);
								const savedPath = getLastPath();

								if (savedPath && uploadedProject) {
									const updatedPath = savedPath.replace(
										/^\/[^/]+/,
										`/${uploadedProject.id}`,
									);
									router.replace(updatedPath);
								} else if (uploadedProject) {
									router.replace(`/${uploadedProject.id}`);
								}
							}}
						/>
					</div>
				</div>

				<div className="Footer-root mt-40 flex flex-col gap-4 lg:mt-0">
					<div className="flex flex-col gap-2 text-left">
						<p className="font-bold">Ein Teil des Projektes</p>
						<SmartWaterLogo className="w-52" />
					</div>
					<div className="flex flex-col gap-2 text-left">
						<p className="font-bold">Gefördert im Rahmen von</p>
						<Funding className="w-full" />
					</div>
					<div className="flex flex-col justify-between font-bold underline underline-offset-4 lg:flex-row">
						<a
							href="https://www.technologiestiftung-berlin.de/impressum/"
							target="_blank"
							rel="noopener noreferrer"
						>
							Impressum
						</a>
						<a
							href="https://www.technologiestiftung-berlin.de/datenschutz/"
							target="_blank"
							rel="noopener noreferrer"
						>
							Datenschutz
						</a>
						<a
							href="https://gemeinsamdigital.berlin.de/de/smart-water/projektpartnerinnen-smartwater/"
							target="_blank"
							rel="noopener noreferrer"
						>
							Projektpartner:innen
						</a>
						<a
							href="https://github.com/technologiestiftung/smartwater-bgi-planer"
							target="_blank"
							rel="noopener noreferrer"
						>
							<GithubLogoIcon className="mr-1 inline-block" />
							Github
						</a>
					</div>
				</div>
			</div>

			<div className="bg-primary hidden items-center justify-center rounded-l-[3.125rem] p-2.5 lg:flex">
				<div className="flex max-w-114 flex-col items-center justify-between gap-8">
					<CarouselWithIndicators
						slides={[
							{
								src: "/images/intro_module_0.png",
								alt: "Projekt",
								title: "Projekt",
								description:
									"Legen Sie zunächst fest, um was für ein Projekt es sich handelt und wo dieses stattfinden soll.",
							},
							{
								src: "/images/intro_module_1.png",
								alt: "Handlungsbedarfe",
								title: "Handlungsbedarfe",
								description:
									"Im ersten Modul werden Fragen zum Projektgebiet gestellt. Anhand Ihrer Antworten werden Prioritäten für verschiedene Handlungsbedarfe abgeleitet und Hotspots für jeden Handlungsbedarf identifiziert.",
							},
							{
								src: "/images/intro_module_2.png",
								alt: "Machbarkeit von Maßnahmen",
								title: "Machbarkeit von Maßnahmen",
								description:
									"Im zweiten Modul können Sie Bereiche identifizieren, in denen die optimalen Maßnahmen für Ihre Handlungsbedarfe tatsächlich umgesetzt werden können.",
							},
							{
								src: "/images/intro_module_3.png",
								alt: "Maßnahmenplanung",
								title: "Maßnahmenplanung",
								description:
									"Im dritten Modul können Sie, basierend auf den zuvor abgeleiteten Handlungsbedarfen und Machbarkeitsbereichen, Maßnahmen in Ihrem Projektgebiet grob planen.",
							},
							{
								src: "/images/intro_effektbewertung.png",
								alt: "Effektbewertung",
								title: "Effektbewertung",
								description:
									"Anschließend können die Auswirkungen Ihrer geplanten Maßnahmen auf Wasserhaushalt, Gewässerschutz, Stadtklima und Überflutungsgefährdung simuliert und bewertet werden.",
							},
						]}
					/>
				</div>
			</div>
		</div>
	);
}
