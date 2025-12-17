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
import { useProjectsStore } from "@/store/projects";
import { steps } from "../Modules/HandlungsbedarfeModule/constants";
import { useAnswersStore } from "@/store";
import { checkForQuestion } from "@/lib/utils";

interface MenuModalProps {
	projectId: string;
}

export default function MenuModalContent({ projectId }: MenuModalProps) {
	const { getProject } = useProjectsStore();
	const project = getProject();
	const answers = useAnswersStore((state) => state.answers);

	const name = project?.name || "Unbenanntes Projekt";
	const description = project?.description || "Keine Beschreibung vorhanden.";

	const getQuestionsNumber = () => {
		return steps.reduce((total, step) => {
			if (!step.questions) return total;
			return (
				total +
				step.questions.filter((currentQuestion) =>
					checkForQuestion(currentQuestion),
				).length
			);
		}, 0);
	};

	const answersLength = Object.keys(answers).filter((key) =>
		checkForQuestion(key),
	).length;

	return (
		<>
			<div className="flex flex-col gap-4">
				<MenuModule
					title={name || "Unbenanntes Projekt"}
					description={description || "Keine Beschreibung vorhanden."}
					sideElements={
						<div className="flex flex-col items-end gap-2">
							<Button asChild className="w-full">
								<Link href={`/${projectId}/edit`}>
									<InfoIcon className="mr-2" />
									Projektinformationen
								</Link>
							</Button>
							<Button asChild className="w-full">
								<Link href={`/${projectId}/project-starter`}>
									<DownloadIcon className="mr-2" />
									Untersuchungsgebiet/Neubauten
								</Link>
							</Button>
							<Button disabled className="w-full">
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
					additionalInfo={`${answersLength} von ${getQuestionsNumber()} Fragen beantwortet`}
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
					additionalInfo="XX von XX Fragen beantwortet"
					buttonBottom={
						<Button disabled>
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
						<Button disabled>
							Zum Modul
							<ArrowCircleRightIcon className="ml-2 size-6" />
						</Button>
					}
				/>
				<div className="flex items-end justify-end px-6 py-4">
					<Button disabled variant="outline">
						<BookOpenTextIcon className="mr-2" />
						Gesamter Report
					</Button>
				</div>
			</div>
		</>
	);
}
