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

function renderLink(href: string, label: string, key: React.Key) {
	const isExternal = href.startsWith("http://") || href.startsWith("https://");

	if (isExternal) {
		return (
			<a
				key={key}
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className="text-primary hover:text-primary-dark break-all underline"
			>
				{label}
			</a>
		);
	}

	return (
		<Link
			key={key}
			href={href}
			className="text-primary hover:text-primary-dark break-all underline"
		>
			{label}
		</Link>
	);
}

function renderTextWithLinks(text: string, key?: React.Key) {
	const linkRegex = /\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s)]+)/g;
	const parts: React.ReactNode[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = linkRegex.exec(text)) !== null) {
		if (match.index > lastIndex) {
			parts.push(text.slice(lastIndex, match.index));
		}

		const fullMatch = match[0];
		const markdownLabel = match[1];
		const markdownHref = match[2];
		const plainUrl = match[3];

		if (markdownLabel && markdownHref) {
			parts.push(
				renderLink(markdownHref, markdownLabel, `md-link-${match.index}`),
			);
		} else if (plainUrl) {
			parts.push(renderLink(plainUrl, plainUrl, `url-link-${match.index}`));
		} else {
			parts.push(fullMatch);
		}

		lastIndex = match.index + fullMatch.length;
	}

	if (lastIndex < text.length) {
		parts.push(text.slice(lastIndex));
	}

	if (parts.length === 0) {
		parts.push(text);
	}

	return (
		<span className="wrap-break-word" key={key}>
			{parts}
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
