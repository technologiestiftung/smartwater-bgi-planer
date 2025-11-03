"use client";

import { FileUploadZone } from "@/components/FileUpload/FileUploadZone";
import { Button } from "@/components/ui/button";
import { CarouselWithIndicators } from "@/components/ui/carousel-with-indicators";
import Funding from "@/logos/gdb_logo.svg";
import SWLogo from "@/logos/SWLogo.svg";
import SmartWaterLogo from "@/logos/SmartWater-Logo.svg";
import {
	GithubLogoIcon,
	PlusSquareIcon,
	UploadIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useProjectsStore } from "@/store/projects";
import { PROJECT_MODE } from "@/store/projects/config";
import { useRouter } from "next/navigation";

export default function Home() {
	const [showUploadAlert, setShowUploadAlert] = useState(false);
	const router = useRouter();
	const { getAllProjects, _hasHydrated } = useProjectsStore();

	useEffect(() => {
		if (PROJECT_MODE === "single" && _hasHydrated) {
			const allProjects = getAllProjects();
			if (allProjects.length > 0) {
				router.replace(`/${allProjects[0].id}`);
			}
		}
	}, [_hasHydrated, getAllProjects, router]);

	return (
		<div className="relativ bg-background grid h-full w-full md:grid-cols-2">
			<div className="flex h-full flex-col justify-between p-18">
				<div className="Logo-root flex flex-col gap-6">
					<SWLogo className="h-28 w-48 max-w-48" />
				</div>
				<div className="Welcome-root flex flex-col gap-6">
					<h1 className="">Herzlich willkommen beim BGI Planer</h1>
					{showUploadAlert && (
						<FileUploadZone
							onFilesChange={(files: File[]) =>
								console.log("Files uploaded:", files)
							}
						/>
					)}
					<div className="flex flex-wrap items-center justify-between gap-2 md:gap-8">
						<Button asChild className="grow">
							<Link href="/new">
								<PlusSquareIcon className="mr-2" />
								<p>Projekt anlegen</p>
							</Link>
						</Button>
						<Button
							variant="outline"
							className="grow"
							onClick={() => setShowUploadAlert(!showUploadAlert)}
						>
							<UploadIcon className="mr-2" />
							<p>Dateien importieren</p>
						</Button>
					</div>
				</div>
				<div className="Footer-root flex flex-col gap-4">
					<div className="flex flex-col gap-2 text-left">
						<p className="font-bold">Ein Teil des Projektes</p>
						<SmartWaterLogo className="w-52" />
					</div>
					<div className="flex flex-col gap-2 text-left">
						<p className="font-bold">Gefördert im Rahmen von</p>
						<Funding className="w-full" />
					</div>
					<div className="flex justify-between font-bold underline underline-offset-4">
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
			<div className="bg-primary flex items-center justify-center rounded-l-[3.125rem] p-2.5">
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
