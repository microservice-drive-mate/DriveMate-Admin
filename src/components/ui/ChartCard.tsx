import "./ChartCard.css"
import type { StatCardVariant } from "../../types"

interface ChartCardProps {
	title: string
	children: React.ReactNode
	variant?: StatCardVariant
	className?: string
}

export function ChartCard({
	title,
	children,
	variant = "light",
	className,
}: ChartCardProps) {
	const classes = ["chart-card", `chart-card--${variant}`, className ?? ""]
		.filter(Boolean)
		.join(" ")

	return (
		<div className={classes}>
			<div className="chart-card__title">{title}</div>
			{children}
		</div>
	)
}
