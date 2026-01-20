"use client";

import MenuModule from "@/components/MenuModal/MenuModule";
import ProjectDownloadButton from "@/components/ProjectDownloadButton/ProjectDownloadButton";
import { Button } from "@/components/ui/button";
import { checkForQuestion } from "@/lib/helpers/questions";
import { useAnswersStore } from "@/store";
import { useProjectsStore } from "@/store/projects";
import {
	ArrowCircleRightIcon,
	BookOpenTextIcon,
	InfoIcon,
	ListMagnifyingGlassIcon,
	PencilRulerIcon,
	PolygonIcon,
	ShovelIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import modulesData from "../Modules/modules.json";

interface MenuModalProps {
	projectId: string;
}

export default function MenuModalContent({ projectId }: MenuModalProps) {
	const getProject = useProjectsStore((state) => state.getProject);
	const project = getProject();
	const answers = useAnswersStore((state) => state.answers);

	const name = project?.name || "Unbenanntes Projekt";
	const description = project?.description || "Keine Beschreibung vorhanden.";

	const getQuestionsNumber = (moduleId: string) => {
		const _module = modulesData.modules.find((m) => m.id === moduleId);
		if (!_module?.steps) return 0;
		return _module.steps.reduce((total: number, step: any) => {
			if (!step.questions) return total;
			return (
				total +
				step.questions.filter((currentQuestion: any) =>
					checkForQuestion(currentQuestion),
				).length
			);
		}, 0);
	};

	const getAnsweredQuestionsLength = (moduleId: string) => {
		const _module = modulesData.modules.find((m) => m.id === moduleId);
		if (!_module?.steps) return 0;
		const questionIds = _module.steps.flatMap((step: any) =>
			(step.questions || []).filter((q: any) => checkForQuestion(q)),
		);
		return Object.keys(answers).filter((key) => questionIds.includes(key))
			.length;
	};

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
									<PolygonIcon className="mr-2" />
									Untersuchungsgebiet/Neubauten
								</Link>
							</Button>
							<ProjectDownloadButton projectId={projectId} />
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
					additionalInfo={`${getAnsweredQuestionsLength("needForAction")} von ${getQuestionsNumber("needForAction")} Fragen beantwortet`}
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
					additionalInfo={`${getAnsweredQuestionsLength("feasibility")} von ${getQuestionsNumber("feasibility")} Fragen beantwortet`}
					buttonBottom={
						<Button asChild>
							<Link href={`/${projectId}/machbarkeit`}>
								Zum Modul
								<ArrowCircleRightIcon className="ml-2 size-6" />
							</Link>
						</Button>
					}
				/>
				<MenuModule
					title="Maßnahmen planen & bewerten"
					description="Die Maßnahmenplanung hilft Ihnen den richtigen Standort für blau-grüne Maßnahmen zu finden."
					sideElements={<PencilRulerIcon className="text-primary size-16" />}
					additionalInfo="Keine Fragen beantwortet"
					buttonBottom={
						<div>
							<Button disabled>
								Zum Modul
								<ArrowCircleRightIcon className="ml-2 size-6" />
							</Button>
						</div>
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
