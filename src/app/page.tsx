"use client";

import SWLogo from "@/logos/SWLogo.svg";
import SmartWaterLogo from "@/logos/SmartWater-Logo.svg";
import { Button } from "@/components/ui/button";
import Funding from "@/logos/Funding.svg";
import {
	PlusSquareIcon,
	UploadIcon,
	GithubLogoIcon,
} from "@phosphor-icons/react";
import { CarouselWithIndicators } from "@/components/ui/carousel-with-indicators";
import Link from "next/link";
import { FileUploadZone } from "@/components/FileUpload/FileUploadZone";
import { useState } from "react";

export default function Home() {
	const [showUploadAlert, setShowUploadAlert] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
						<Button asChild className="flex-grow">
							<Link href="/new">
								<PlusSquareIcon className="mr-2" />
								<p>Projekt anlegen</p>
							</Link>
						</Button>
						<Button
							variant="outline"
							className="flex-grow"
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
				<div className="flex max-w-[28.5rem] flex-col items-center justify-between gap-8">
					<CarouselWithIndicators
						slides={[
							{
								src: "/images/placeholder.png",
								alt: "Intro Slide 1",
								title: "Einführung",
								description:
									"Starten Sie doch zunächst mit einer kleinen Einführung, damit Sie sehen was man mit diesem Webtool erreichen und bearbeiten kann.",
							},
							{
								src: "/images/placeholder.png",
								alt: "Intro Slide 2",
								title: "Funktionen",
								description:
									"Entdecken Sie die verschiedenen Module und Werkzeuge für Ihre Projektplanung.",
							},
							{
								src: "/images/placeholder.png",
								alt: "Intro Slide 3",
								title: "Los geht's",
								description:
									"Erstellen Sie Ihr erstes Projekt und beginnen Sie mit der Planung Ihrer blau-grünen Maßnahmen.",
							},
						]}
					/>
				</div>
			</div>
		</div>
	);
}
