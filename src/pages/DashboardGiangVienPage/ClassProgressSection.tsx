import { useState } from "react"
import { SectionCard } from "../../components/ui/SectionCard"
import { ProgressBar } from "../../components/ui/ProgressBar"
import type { ClassProgress } from "../../types"

interface ClassProgressSectionProps {
	classes: ClassProgress[]
}

export function ClassProgressSection({ classes }: ClassProgressSectionProps) {
	const [expanded, setExpanded] = useState<string | null>(null)

	const toggle = (id: string) =>
		setExpanded((prev) => (prev === id ? null : id))

	return (
		<SectionCard title="Class Progress" variant="dark">
			<div className="gv-progress-list">
				{classes.map((cls) => {
					const hasStudents = cls.students.length > 0
					const isOpen = expanded === cls.id
					return (
						<div key={cls.id} className="gv-progress-item">
							<div
								className="gv-progress-item__header"
								onClick={
									hasStudents
										? () => toggle(cls.id)
										: undefined
								}
								style={{
									cursor: hasStudents ? "pointer" : "default",
								}}
							>
								<span className="gv-progress-item__name">
									{hasStudents
										? `${isOpen ? "▾" : "▸"} ${cls.name}`
										: cls.name}
								</span>
								<span className="gv-progress-item__count">
									{cls.completed}/{cls.total} students
									completed
								</span>
							</div>
							<ProgressBar percent={cls.percent} />
							{isOpen && (
								<div style={{ marginTop: 10 }}>
									{cls.students.map((s) => (
										<div
											key={s.id}
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												fontSize: 13,
												padding: "4px 0",
												borderTop:
													"1px solid rgba(255,255,255,0.06)",
											}}
										>
											<span style={{ color: "#d0d0d0" }}>
												{s.name}
											</span>
											<span style={{ color: "#888888" }}>
												{s.status} · {s.progress}%
											</span>
										</div>
									))}
								</div>
							)}
						</div>
					)
				})}
			</div>
		</SectionCard>
	)
}
