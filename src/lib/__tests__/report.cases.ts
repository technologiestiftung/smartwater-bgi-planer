// lib/__tests__/report.cases.ts

import { buildBulletXml, buildXMLTitle } from "../report/buildXML";

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
					title: buildXMLTitle("Starkregen", "yellow"),
					content: [
						buildBulletXml(
							"Starkregengefährdung",
							"green",
							"Notizen für Starkregengefährdung",
						),
						buildBulletXml(
							"Feuerwehreinsätze",
							"red",
							"Notizen für Feuerwehreinsätze",
						),
					].join(""),
				},
				{
					title: buildXMLTitle("Hitze", "red"),
					content: [
						buildBulletXml(
							"Hitzebelastung am Tag",
							"green",
							"Notizen für Hitzebelastung am Tag",
						),
						buildBulletXml(
							"Hitzebelastung in der Nacht",
							"red",
							"Notizen für Hitzebelastung in der Nacht",
						),
						buildBulletXml(
							"Vulnerable Bereiche",
							"yellow",
							"Notizen für Vulnerable Bereiche",
						),
						buildBulletXml(
							"Luftaustausch: Kaltluftbahnen & Leitbahnkorridore",
							"yellow",
							"Notizen für Luftaustausch: Kaltluftbahnen & Leitbahnkorridore",
						),
						buildBulletXml(
							"Kaltluftentstehung",
							"green",
							"Notizen für Kaltluftentstehung",
						),
					].join(""),
				},
				{
					title: buildXMLTitle("Versiegelung", "green"),
					content: [
						buildBulletXml("Versiegelung", "green", "Notizen für Versiegelung"),
						buildBulletXml(
							"Grünvolumenzahl",
							"green",
							"Notizen für Grünvolumenzahl",
						),
					].join(""),
				},
				{
					title: buildXMLTitle(
						"Wasserhaushalt",
						"green",
						"Notizen für Wasserhaushalt",
					),
				},
				{
					title: buildXMLTitle("Gewässerschutz", "yellow"),
					content: [
						buildBulletXml(
							"Art der Kanalisation",
							"red",
							"Notizen für Art der Kanalisation",
						),
						buildBulletXml(
							"Erstaufnehmendes Gewässer im Einzugsbereich der Trennkanalisation",
							"green",
							"Notizen für Erstaufnehmendes Gewässer im Einzugsbereich der Trennkanalisation",
						),
						buildBulletXml(
							"Kleingewässer",
							"green",
							"Notizen für Kleingewässer",
						),
					].join(""),
				},
			],
			machbarkeit: [
				{
					title: buildXMLTitle("Altlasten", "red", "Notizen für Altlasten"),
				},
				{
					title: buildXMLTitle(
						"Unterirdische Infrastrukturen",
						"green",
						"Notizen für Unterirdische Infrastrukturen",
					),
				},
				{
					title: buildXMLTitle(
						"Altbaumbestand",
						"green",
						"Notizen für Altbaumbestand",
					),
				},
				{
					title: buildXMLTitle(
						"Geologischer Untergrund",
						"green",
						"Notizen für Geologischer Untergrund",
					),
				},
				{
					title: buildXMLTitle(
						"Denkmalschutz",
						"green",
						"Notizen für Denkmalschutz",
					),
				},
			],
			dachbegruenung: "409",
		},
	},
];
