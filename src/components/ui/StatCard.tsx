import "./StatCard.css"
import type { StatCardVariant, ChangeType } from "../../types"

interface StatCardProps {
	title: string
	value: string
	icon: string
	iconBg: string
	variant?: StatCardVariant
	change?: string
	changeLabel?: string
	changeType?: ChangeType
}

export function StatCard({
	title,
	value,
	icon,
	iconBg,
	variant = "light",
	change,
	changeLabel,
	changeType,
}: StatCardProps) {
	return (
		<div className={`stat-card stat-card--${variant}`}>
			<div className="stat-card__info">
				<div className="stat-card__title">{title}</div>
				<div className="stat-card__value">{value}</div>
				{change && (
					<div className="stat-card__change">
						<span
							className={`stat-card__change-badge stat-card__change-badge--${changeType}`}
						>
							{changeType === "positive" ? "↑" : "↓"} {change}
						</span>
						{changeLabel}
					</div>
				)}
			</div>
			<div className="stat-card__icon" style={{ background: iconBg }}>
				{icon}
			</div>
		</div>
	)
}
