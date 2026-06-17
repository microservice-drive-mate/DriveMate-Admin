import { StatCard } from "../../components/ui/StatCard"
import type { InstructorStatCard } from "../../types"

interface StatCardsSectionProps {
	cards: InstructorStatCard[]
}

export function StatCardsSection({ cards }: StatCardsSectionProps) {
	return (
		<div className="gv-stats-grid">
			{cards.map((card) => (
				<StatCard
					key={card.title}
					variant="dark"
					title={card.title}
					value={card.value}
					icon={card.icon}
					iconBg={card.iconBg}
				/>
			))}
		</div>
	)
}
