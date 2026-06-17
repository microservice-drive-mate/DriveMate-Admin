import { SectionCard } from "../../components/ui/SectionCard"
import { Button } from "../../components/ui/Button"
import type { TodaySession } from "../../types"

interface TodayScheduleSectionProps {
	sessions: TodaySession[]
}

export function TodayScheduleSection({ sessions }: TodayScheduleSectionProps) {
	return (
		<SectionCard title="Today's Schedule" variant="dark">
			<div className="gv-schedule-list">
				{sessions.map((session) => (
					<div key={session.id} className="gv-schedule-item">
						<span className="gv-schedule-item__time">
							{session.timeRange}
						</span>
						<div className="gv-schedule-item__info">
							<span className="gv-schedule-item__class">
								{session.className}
							</span>
							<span className="gv-schedule-item__meta">
								{session.room} • {session.studentCount} students
							</span>
						</div>
						<Button
							variant="primary"
							style={{
								padding: "7px 16px",
								fontSize: 13,
								marginTop: 0,
							}}
						>
							Attendance
						</Button>
					</div>
				))}
			</div>
		</SectionCard>
	)
}
