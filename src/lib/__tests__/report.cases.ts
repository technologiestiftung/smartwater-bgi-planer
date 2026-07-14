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
							"green",
							"Starkregengefährdung",
							"Notizen für Starkregengefährdung",
						),
						buildBulletXml(
							"red",
							"Feuerwehreinsätze",
							"Notizen für Feuerwehreinsätze",
						),
					].join(""),
				},
				{
					title: buildXMLTitle("Hitze", "red"),
					content: [
						buildBulletXml(
							"green",
							"Hitzebelastung am Tag",
							"Notizen für Hitzebelastung am Tag",
						),
						buildBulletXml(
							"red",
							"Hitzebelastung in der Nacht",
							"Notizen für Hitzebelastung in der Nacht",
						),
						buildBulletXml(
							"yellow",
							"Vulnerable Bereiche",
							"Notizen für Vulnerable Bereiche",
						),
						buildBulletXml(
							"yellow",
							"Luftaustausch: Kaltluftbahnen & Leitbahnkorridore",
							"Notizen für Luftaustausch: Kaltluftbahnen & Leitbahnkorridore",
						),
						buildBulletXml(
							"green",
							"Kaltluftentstehung",
							"Notizen für Kaltluftentstehung",
						),
					].join(""),
				},
				{
					title: buildXMLTitle("Versiegelung", "green"),
					content: [
						buildBulletXml("green", "Versiegelung", "Notizen für Versiegelung"),
						buildBulletXml(
							"green",
							"Grünvolumenzahl",
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
							"red",
							"Art der Kanalisation",
							"Notizen für Art der Kanalisation",
						),
						buildBulletXml(
							"green",
							"Erstaufnehmendes Gewässer im Einzugsbereich der Trennkanalisation",
							"Notizen für Erstaufnehmendes Gewässer im Einzugsbereich der Trennkanalisation",
						),
						buildBulletXml(
							"green",
							"Kleingewässer",
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
