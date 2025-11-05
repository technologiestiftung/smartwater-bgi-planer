"use client";

import MenuModule from "@/components/MenuModal/MenuModule";
import { Button } from "@/components/ui/button";
import {
	ArrowCircleRightIcon,
	BookOpenTextIcon,
	DownloadIcon,
	InfoIcon,
	ListMagnifyingGlassIcon,
	PencilRulerIcon,
	ShovelIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

interface MenuModalProps {
	projectId: string;
}

export default function MenuModalContent({ projectId }: MenuModalProps) {
	return (
		<>
			<div className="flex flex-col gap-4">
				<MenuModule
					title="Projektname v1.55 final final"
					description="Dies ist eine Teaser der Projektbeschreibung. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."
					sideElements={
						<div className="flex flex-col items-end gap-2">
							<Button asChild>
								<Link href={`/${projectId}/edit`}>
									<InfoIcon className="mr-2" />
									Projektinformationen
								</Link>
							</Button>
							<Button>
								<Link href={`/${projectId}/project-starter`}>
									<DownloadIcon className="mr-2" />
									Untersuchungsgebiet/Neubauten
								</Link>
							</Button>
							<Button>
								<DownloadIcon className="mr-2" />
								Download und speichern
							</Button>
						</div>
					}
				/>
			</div>
			<div className="grid gap-0 md:grid-cols-2">
				<MenuModule
					title="Handlungsbedarfe"
					description="In diesem Modul können Sie Ihr Unter-suchungsgebiet auf Handlungsbedarfe hin untersuchen."
					sideElements={
						<ListMagnifyingGlassIcon className="text-primary size-16" />
					}
					additionalInfo="17 von 21 Fragen beantwortet"
					buttonBottom={
						<Button asChild>
							<Link href={`/${projectId}/handlungsbedarfe`}>
								Zum Modul
								<ArrowCircleRightIcon className="ml-2 size-6" />
							</Link>
						</Button>
					}
				/>
				<MenuModule
					title="Machbarkeit von Maßnahmen"
					description="Prüfen Sie in diesem Modul die Machbarkeit der blau-grünen Maßnahmen am gewählten Standort."
					sideElements={<ShovelIcon className="text-primary size-16" />}
					additionalInfo="17 von 21 Fragen beantwortet"
					buttonBottom={
						<Button>
							Zum Modul
							<ArrowCircleRightIcon className="ml-2 size-6" />
						</Button>
					}
				/>
				<MenuModule
					title="Maßnahmen planen & bewerten"
					description="Die Maßnahmenplanung hilft Ihnen den richtigen Standort für blau-grüne Maßnahmen zu finden."
					sideElements={<PencilRulerIcon className="text-primary size-16" />}
					additionalInfo="3 Maßnahmen platziert"
					buttonBottom={
						<Button>
							Zum Modul
							<ArrowCircleRightIcon className="ml-2 size-6" />
						</Button>
					}
				/>
				<div className="flex items-end justify-end px-6 py-4">
					<Button variant="outline">
						<BookOpenTextIcon className="mr-2" />
						Gesamter Report
					</Button>
				</div>
			</div>
		</>
	);
}
