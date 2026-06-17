import "./SectionCard.css"
import type { StatCardVariant } from "../../types"

interface SectionCardProps {
	title: string
	children: React.ReactNode
	variant?: StatCardVariant
}

export function SectionCard({
	title,
	children,
	variant = "light",
}: SectionCardProps) {
	return (
		<div className={`section-card section-card--${variant}`}>
			<div className="section-card__title">{title}</div>
			{children}
		</div>
	)
}
