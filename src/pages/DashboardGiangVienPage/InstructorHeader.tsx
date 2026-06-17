import { Avatar } from "../../components/ui/Avatar"
import type { InstructorProfile } from "../../types"

interface InstructorHeaderProps {
	instructor: InstructorProfile
}

export function InstructorHeader({ instructor }: InstructorHeaderProps) {
	return (
		<div className="gv-dashboard__header">
			<div className="gv-dashboard__header-text">
				<h1 className="gv-dashboard__title">Instructor Dashboard</h1>
				<p className="gv-dashboard__subtitle">
					Track teaching progress and student results
				</p>
			</div>
			<div className="gv-profile-card">
				<Avatar
					initials={instructor.initials}
					size="lg"
					bg="#fdb913"
					color="#0f172a"
				/>
				<div className="gv-profile-card__info">
					<span className="gv-profile-card__name">
						{instructor.name}
					</span>
					<span className="gv-profile-card__role">
						{instructor.role}
					</span>
				</div>
			</div>
		</div>
	)
}
