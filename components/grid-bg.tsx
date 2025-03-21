"use client";

import { cn } from "@/lib/utils";

interface GridBackgroundProps {
	gridSize?: number;
	lineColor?: string;
	backgroundColor?: string;
	className?: string;
	fixed?: boolean;
}

export default function GridBackground({
	gridSize = 40,
	lineColor = "rgba(0, 0, 0, 0.05)",
	backgroundColor = "white",
	className,
	fixed = false,
}: GridBackgroundProps) {
	return (
		<div
			className={cn(
				"w-full h-full overflow-hidden",
				fixed && "fixed inset-0 -z-10",
				className
			)}
			style={{
				backgroundColor,
				backgroundImage: `
          linear-gradient(to right, ${lineColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)
        `,
				backgroundSize: `${gridSize}px ${gridSize}px`,
			}}
		/>
	);
}
