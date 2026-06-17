import { StatCard } from "../../components/ui/StatCard"
import type { AdminStatCard } from "../../types"

interface StatCardsSectionProps {
	cards: AdminStatCard[]
}

export function StatCardsSection({ cards }: StatCardsSectionProps) {
	return (
		<div className="stats-grid">
			{cards.map((card) => (
				<StatCard
					key={card.title}
					variant="dark"
					title={card.title}
					value={card.value}
					icon={card.icon}
					iconBg={card.iconBg}
					change={card.change}
					changeLabel={card.changeLabel}
					changeType={card.changeType}
				/>
			))}
		</div>
	)
}
