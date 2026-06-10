"use client";

import { Button } from "@/components/ui/button";
import { LeafIcon, PlantIcon, TreeIcon } from "@phosphor-icons/react";
import { FC } from "react";
import { type TreeSize, useDrawTree } from "./useDrawTree";

const TREE_SIZES: { size: TreeSize; label: string; icon: typeof TreeIcon }[] = [
	{ size: "sm", label: "Kleiner Baum", icon: LeafIcon },
	{ size: "md", label: "Mittelgroßer Baum", icon: PlantIcon },
	{ size: "lg", label: "Großer Baum", icon: TreeIcon },
];

export const DrawTreeMeasureButton: FC = () => {
	const { isDrawing, activeSize, startDraw } = useDrawTree();

	return (
		<div className="flex gap-2">
			{TREE_SIZES.map(({ size, label, icon: Icon }) => (
				<Button
					key={size}
					variant={isDrawing && activeSize === size ? "default" : "outline"}
					onClick={() => startDraw(size)}
				>
					<Icon />
					{label}
				</Button>
			))}
		</div>
	);
};
