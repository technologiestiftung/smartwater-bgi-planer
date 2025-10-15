"use client";
import Image from "next/image";
import logo from "@/logos/smartwater-bgi-planer-logo.svg";
import favicon from "@/logos/Favicon.svg";
import example from "../resources/example.json";
import Icon from "@/components/Icon";
import { Button } from "@/components/ui/app-button";

export default function Styleguide() {
	const colors = [
		"bg-primary",
		"bg-secondary",
		"bg-accent",
		"bg-light",
		"bg-red",
		"bg-orange",
		"bg-yellow",
		"bg-green",
		"bg-white",
		"bg-lighter",
		"bg-mid",
		"bg-mid-darker",
		"bg-dark",
		"bg-black",
	];
	return (
		<main className="flex flex-col items-center py-10">
			<div className="flex flex-col w-[900px] gap-4">
				<div>
					<h2 className="text-primary">Farben</h2>
					<div className="flex gap-4 flex-wrap mt-4">
						{colors.map((color) => {
							return (
								<div key={color}>
									<div className={`w-24 h-24 rounded-full ${color}`} />
									<p className="text-center">{color.replace("bg-", "")}</p>
								</div>
							);
						})}
					</div>
				</div>
				<hr className="my-8 border-t-2 border-black" />
				<div className="flex flex-col gap-12">
					<h1 className="text-primary">
						Headline 1 - Main page title, hero sections
					</h1>
					<h2 className="text-primary">Headline 2 - Section headings</h2>
					<h3 className="text-primary">Headline 3 - Subsection titles</h3>
					<h4 className="text-primary">
						Headline 4 - Card titles, small section headers
					</h4>
					<p className="text-primary">
						Body - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
						do eiusmod tempor incididunt ut labore et dolore magna aliqua.
					</p>
					<p className="text-primary italic">
						Body Italic - Lorem ipsum dolor sit amet, consectetur adipiscing
						elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
						aliqua.
					</p>
					<p className="text-primary bold">
						Body Bold - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
					</p>
					<a className="text-primary">Link Text</a>
					<p className="text-primary caption">
						Caption - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
					</p>
					<p className="text-primary caption-italic">
						Caption Italic - Lorem ipsum dolor sit amet, consectetur adipiscing
						elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
						aliqua.
					</p>
					<p className="text-primary caption-small">
						Caption Small - Lorem ipsum dolor sit amet, consectetur adipiscing
						elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
						aliqua.
					</p>
				</div>
				<hr className="my-8 border-t-2 border-black" />
				<div>
					<h2 className="text-primary">Logo</h2>
					<Image
						src={logo}
						alt={"Smartwater BGI Planer Logo"}
						className="mt-4"
						height={64}
					/>
				</div>
				<hr className="my-8 border-t-2 border-black" />
				<div>
					<h2 className="text-primary">Favicon</h2>
					<Image
						src={favicon}
						alt={"Smartwater BGI Planer Favicon"}
						className="mt-4"
						height={64}
					/>
				</div>
				<hr className="my-8 border-t-2 border-black" />
				<div>
					<h2 className="text-primary">Icons Selection</h2>
					<div className="flex gap-12">
						<div className="flex flex-col flex-wrap mt-4 gap-6">
							{example.map((icon, index) => (
								<div key={index} className="flex items-center gap-6">
									<Icon id={icon.icon} className="text-primary text-2xl" />
									<h3 className="text-primary font-medium">{icon.name}</h3>
								</div>
							))}
						</div>
						<div className="flex flex-col flex-wrap mt-4 gap-6">
							{example.map((icon, index) => (
								<div key={index} className="flex items-center gap-6">
									<div className="bg-primary rounded-full p-3">
										<Icon id={icon.icon} className="text-white text-2xl" />
									</div>
									<h3 className="text-primary font-medium">{icon.name}</h3>
								</div>
							))}
						</div>
					</div>
				</div>
				<hr className="my-8 border-t-2 border-black" />
				<div className="flex flex-col gap-4">
					<h2 className="text-primary">Buttons</h2>
					<Button
						text="Fischen gehen"
						icon="fish"
						onClick={() => window.alert("Primary Button!")}
					/>
					<Button text="Bearbeiten" />
					<Button
						text="Regen machen"
						variant={"secondary"}
						icon="cloud-rain"
						onClick={() => window.alert("Secondary Button!")}
					/>
					<Button text="Bearbeiten" variant={"secondary"} />
				</div>
				<hr className="my-8 border-t-2 border-black" />
			</div>
		</main>
	);
}
