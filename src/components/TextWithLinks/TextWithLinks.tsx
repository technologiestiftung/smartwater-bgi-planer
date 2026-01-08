import Link from "next/link";

interface TextWithLinksProps {
	text: string | undefined;
	className?: string;
}

export function TextWithLinks({ text, className = "" }: TextWithLinksProps) {
	if (!text) return <span className={className}>{text}</span>;

	const urlRegex = /(https?:\/\/[^\s)]+)/g;
	const parts = text.split(urlRegex);

	return (
		<span className={`wrap-break-word ${className}`}>
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
