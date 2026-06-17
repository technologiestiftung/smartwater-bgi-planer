"use client";

import * as React from "react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from "@/components/ui/carousel";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface CarouselWithIndicatorsProps {
	slides: {
		src: string;
		alt: string;
		title?: string;
		description?: string;
	}[];
	hideTitle?: boolean;
	slideWidth?: number;
	narrow?: boolean;
	dark?: boolean;
}

export function CarouselWithIndicators({
	slides,
	hideTitle = false,
	slideWidth = 0,
	narrow = false,
	dark = false,
}: CarouselWithIndicatorsProps) {
	const [api, setApi] = React.useState<CarouselApi>();
	const [current, setCurrent] = React.useState(0);

	React.useEffect(() => {
		if (!api) {
			return;
		}

		setCurrent(api.selectedScrollSnap());

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);

	return (
		<div className={cn("flex flex-col", narrow ? "gap-2" : "gap-6")}>
			{!hideTitle && (
				<div className="mt-12 flex min-h-48 flex-col justify-end gap-2 text-left text-white">
					{slides[current]?.title && (
						<>
							<h2>{slides[current].title}</h2>
							{slides[current].description && (
								<p>{slides[current].description}</p>
							)}
						</>
					)}
				</div>
			)}
			<div
				className={cn(
					"flex flex-1 items-center justify-center",
					slideWidth
						? "h-[var(--slide-height)] overflow-hidden"
						: "h-[26.25vw]",
				)}
				style={
					{
						"--slide-height": slideWidth * 0.75 + "px",
					} as CSSProperties
				}
			>
				<Carousel setApi={setApi} opts={{ loop: true }}>
					<CarouselContent
						className={cn(
							"aspect-[4/3]",
							slideWidth ? "w-[var(--slide-width)]" : "w-[30vw]",
						)}
						style={
							{
								"--slide-width": slideWidth + "px",
							} as CSSProperties
						}
					>
						{slides.map((slide, index) => (
							<CarouselItem key={index} className="relative">
								<Image
									src={slide.src}
									alt={slide.alt}
									fill
									sizes={slideWidth ? `${slideWidth}px` : "30vw"}
									priority={index === 0}
									className="object-cover"
								/>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious
						variant="ghost"
						className={cn(
							narrow && "absolute top-1/2 left-4 z-10 -translate-y-1/2",
						)}
					/>
					<CarouselNext
						variant="ghost"
						className={cn(
							narrow && "absolute top-1/2 right-4 z-10 -translate-y-1/2",
						)}
					/>
				</Carousel>
			</div>
			{slides.length > 1 && (
				<div className="flex items-center justify-center gap-4">
					{slides.map((_, index) => (
						<button
							key={index}
							onClick={() => api?.scrollTo(index)}
							className={`size-3 cursor-pointer rounded-full transition-all ${
								index === current
									? dark
										? "bg-primary"
										: "bg-background"
									: cn(
											"hover:bg-background/75 border",
											dark ? "border-primary" : "border-background",
										)
							}`}
							aria-label={`Go to slide ${index + 1}`}
						/>
					))}
				</div>
			)}
			{slides[current]?.description && narrow && (
				<p className="text-center">{slides[current].description}</p>
			)}
		</div>
	);
}
