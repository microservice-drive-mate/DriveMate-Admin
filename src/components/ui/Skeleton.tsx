import "./Skeleton.css"

interface SkeletonProps {
	variant?: "text" | "block"
	width?: string | number
	height?: string | number
	className?: string
}

function toCssSize(value: string | number | undefined) {
	return typeof value === "number" ? `${value}px` : value
}

export function Skeleton({
	variant = "block",
	width,
	height,
	className = "",
}: SkeletonProps) {
	const classes = ["skeleton", `skeleton--${variant}`, className]
		.filter(Boolean)
		.join(" ")

	return (
		<span
			aria-hidden="true"
			className={classes}
			style={{
				width: toCssSize(width),
				height: toCssSize(height),
			}}
		/>
	)
}
