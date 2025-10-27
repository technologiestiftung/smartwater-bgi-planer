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
			{slides[current]?.title && (
				<div className="mt-12 flex flex-col gap-2 text-left text-white">
					<h2>{slides[current].title}</h2>
					{slides[current].description && <p>{slides[current].description}</p>}
				</div>
			)}
			<div className="flex flex-1 items-center justify-center">
				<Carousel setApi={setApi}>
					<CarouselContent className="h-60 w-96">
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
					<CarouselPrevious />
					<CarouselNext />
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
