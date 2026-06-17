interface SummaryCardProps {
	title: string
	value: string | number
	accent?: string
}

export function SummaryCard({ title, value, accent }: SummaryCardProps) {
	return (
		<div className="q-summary-card">
			<div className="q-summary-card__title">{title}</div>
			<div
				className="q-summary-card__value"
				style={accent ? { color: accent } : undefined}
			>
				{typeof value === "number"
					? value.toLocaleString("vi-VN")
					: value}
			</div>
		</div>
	)
}
