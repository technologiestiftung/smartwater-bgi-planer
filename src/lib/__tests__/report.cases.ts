// lib/__tests__/report.cases.ts

import {
	buildHazardBulletXml,
	buildHazardTitle,
} from "../report/buildHazardBullet";

export type ReportTestCase = {
	name: string;
	data: Record<string, any>;
};

export const reportCases: ReportTestCase[] = [
	{
		name: "testing report generation",
		data: {
			project_name: "Acme Rollout",
			project_type: "Rollout",
			project_description: "Description of the rollout",
			current_date: "2024-06-05",
			handlungsbedarfe: [
				{
					hazard_title: buildHazardTitle("red", "Starkregen"),
					hazards_xml: [
						buildHazardBulletXml("red", "Starkregen"),
						buildHazardBulletXml("red", "Feuerwehreinsätze", "Some notes"),
					].join(""),
				},
				{
					hazard_title: buildHazardTitle("blue", "Wasser"),
					hazards_xml: [
						buildHazardBulletXml("green", "Nässe"),
						buildHazardBulletXml("magenta", "Stausee", "Some notes"),
					].join(""),
				},
			],
		},
	},
];
