interface SummaryCardProps {
	title: string
	value: string
	accent: string
}

export function SummaryCard({ title, value, accent }: SummaryCardProps) {
	return (
		<div className="student-summary-card">
			<div className="student-summary-card__title">{title}</div>
			<div
				className="student-summary-card__value"
				style={{ color: accent }}
			>
				{value}
			</div>
		</div>
	)
}
