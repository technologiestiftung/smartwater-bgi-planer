import Link from "next/link";
import React from "react";

export type RichTextContent =
	| string
	| {
			type: "bullets";
			items: string[];
	  };

interface RichTextWithLinksProps {
	text: RichTextContent | RichTextContent[] | undefined;
	className?: string;
}

function renderTextWithLinks(text: string, key?: React.Key) {
	const urlRegex = /(https?:\/\/[^\s)]+)/g;
	const parts = text.split(urlRegex);
	return (
		<span className="wrap-break-word" key={key}>
			{parts.map((part, i) => {
				if (part.match(urlRegex)) {
					const isExternal =
						part.startsWith("http://") || part.startsWith("https://");
					if (isExternal) {
						return (
							<a
								key={i}
								href={part}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:text-primary-dark break-all underline"
							>
								{part}
							</a>
						);
					}
					return (
						<Link
							key={i}
							href={part}
							className="text-primary hover:text-primary-dark break-all underline"
						>
							{part}
						</Link>
					);
				}
				return part;
			})}
		</span>
	);
}

export function RichTextWithLinks({
	text,
	className = "",
}: RichTextWithLinksProps) {
	if (!text) return <span className={className}>{text}</span>;

	if (typeof text === "string") {
		return <span className={className}>{renderTextWithLinks(text)}</span>;
	}

	if (!Array.isArray(text)) {
		if (text.type === "bullets" && Array.isArray(text.items)) {
			return (
				<ul className={`ml-4 list-inside list-disc ${className}`}>
					{text.items.map((item, i) => (
						<li key={i}>{renderTextWithLinks(item)}</li>
					))}
				</ul>
			);
		}
		return null;
	}

	return (
		<div className={`flex flex-col gap-3 ${className}`}>
			{text.map((item, idx) => {
				if (typeof item === "string") {
					return <p key={idx}>{renderTextWithLinks(item)}</p>;
				}
				if (item && item.type === "bullets" && Array.isArray(item.items)) {
					return (
						<ul className="ml-4 list-inside list-disc" key={idx}>
							{item.items.map((bullet, i) => (
								<li key={i}>{renderTextWithLinks(bullet)}</li>
							))}
						</ul>
					);
				}
				return null;
			})}
		</div>
	);
}
