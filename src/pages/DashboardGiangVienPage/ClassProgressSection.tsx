import { useState } from "react"
import { SectionCard } from "../../components/ui/SectionCard"
import { ProgressBar } from "../../components/ui/ProgressBar"
import type { ClassProgress } from "../../types"
import { ClassStudentsModal } from "./ClassStudentsModal"

interface ClassProgressSectionProps {
	classes: ClassProgress[]
}

export function ClassProgressSection({ classes }: ClassProgressSectionProps) {
	const [selectedClass, setSelectedClass] = useState<ClassProgress | null>(
		null,
	)

	return (
		<SectionCard title="Class Progress" variant="dark">
			<div className="gv-progress-list">
				{classes.map((cls) => {
					const hasStudents = cls.students.length > 0
					return (
						<div key={cls.id} className="gv-progress-item">
							<div className="gv-progress-item__header">
								<span className="gv-progress-item__name">
									{cls.name}
								</span>
								<span className="gv-progress-item__count">
									{cls.completed}/{cls.total} students
									completed
								</span>
							</div>
							<ProgressBar percent={cls.percent} />
							<button
								className="gv-progress-item__view"
								onClick={() => setSelectedClass(cls)}
								disabled={!hasStudents}
							>
								Xem học viên
							</button>
						</div>
					)
				})}
			</div>

			{selectedClass && (
				<ClassStudentsModal
					classItem={selectedClass}
					onClose={() => setSelectedClass(null)}
				/>
			)}
		</SectionCard>
	)
}
