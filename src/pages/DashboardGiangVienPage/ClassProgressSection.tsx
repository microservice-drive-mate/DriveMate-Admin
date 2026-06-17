import { SectionCard } from "../../components/ui/SectionCard"
import { ProgressBar } from "../../components/ui/ProgressBar"
import type { ClassProgress } from "../../types"

interface ClassProgressSectionProps {
	classes: ClassProgress[]
}

export function ClassProgressSection({ classes }: ClassProgressSectionProps) {
	return (
		<SectionCard title="Class Progress" variant="dark">
			<div className="gv-progress-list">
				{classes.map((cls) => (
					<div key={cls.id} className="gv-progress-item">
						<div className="gv-progress-item__header">
							<span className="gv-progress-item__name">
								{cls.name}
							</span>
							<span className="gv-progress-item__count">
								{cls.completed}/{cls.total} students completed
							</span>
						</div>
						<ProgressBar percent={cls.percent} />
					</div>
				))}
			</div>
		</SectionCard>
	)
}
