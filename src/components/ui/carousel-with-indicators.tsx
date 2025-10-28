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

interface CarouselWithIndicatorsProps {
	slides: {
		src: string;
		alt: string;
		title?: string;
		description?: string;
	}[];
}

export function CarouselWithIndicators({
	slides,
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
		<div className="flex flex-col gap-6">
			<div className="mt-12 flex h-32 flex-col gap-2 text-left text-white">
				{slides[current]?.title && (
					<>
						<h2>{slides[current].title}</h2>
						{slides[current].description && (
							<p>{slides[current].description}</p>
						)}
					</>
				)}
			</div>
			<div className="flex h-[26.25vw] flex-1 items-center justify-center">
				<Carousel setApi={setApi} opts={{ loop: true }}>
					<CarouselContent className="aspect-[4/3] w-[35vw]">
						{slides.map((slide, index) => (
							<CarouselItem key={index} className="relative">
								<Image
									src={slide.src}
									alt={slide.alt}
									fill
									className="object-cover"
								/>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious variant="ghost" />
					<CarouselNext variant="ghost" />
				</Carousel>
			</div>
			<div className="flex items-center justify-center gap-4">
				{slides.map((_, index) => (
					<button
						key={index}
						onClick={() => api?.scrollTo(index)}
						className={`size-3 rounded-full transition-all ${
							index === current
								? "bg-background"
								: "border-background hover:bg-background/75 border"
						}`}
						aria-label={`Go to slide ${index + 1}`}
					/>
				))}
			</div>
		</div>
	);
}
