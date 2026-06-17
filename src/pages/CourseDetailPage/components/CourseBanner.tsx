import type { CourseResponse } from "@/types/course.types"
import { COURSE_STATUS_LABELS } from "@/types/course.types"

function formatFee(fee: number) {
	return fee.toLocaleString("vi-VN") + "đ"
}

interface CourseBannerProps {
	course: CourseResponse
}

export function CourseBanner({ course }: CourseBannerProps) {
	return (
		<div className="course-detail__banner">
			<div className="course-detail__banner-left">
				<div className="course-detail__class-badge">
					{course.licenseCategory}
				</div>
				<span
					className={`course-detail__status-badge course-detail__status-badge--${course.status.toLowerCase()}`}
				>
					{COURSE_STATUS_LABELS[course.status]}
				</span>
				{course.courseCode && (
					<div className="course-detail__code-badge">
						{course.courseCode}
					</div>
				)}
			</div>
			<div className="course-detail__banner-right">
				{course.description && (
					<p className="course-detail__desc">{course.description}</p>
				)}
				<div className="course-detail__stats">
					<div className="course-detail__stat">
						<span className="course-detail__stat-icon">⏱</span>
						<div>
							<div className="course-detail__stat-label">
								Thời lượng
							</div>
							<div className="course-detail__stat-value">
								{course.duration ?? "—"}
							</div>
						</div>
					</div>
					<div className="course-detail__stat">
						<span className="course-detail__stat-icon">📖</span>
						<div>
							<div className="course-detail__stat-label">
								Bài học
							</div>
							<div className="course-detail__stat-value">
								{course.totalLessons}
							</div>
						</div>
					</div>
					<div className="course-detail__stat">
						<span className="course-detail__stat-icon">👥</span>
						<div>
							<div className="course-detail__stat-label">
								Sức chứa
							</div>
							<div className="course-detail__stat-value">
								{course.capacity ?? "—"}
							</div>
						</div>
					</div>
					<div className="course-detail__stat">
						<span className="course-detail__stat-icon">💰</span>
						<div>
							<div className="course-detail__stat-label">
								Học phí
							</div>
							<div className="course-detail__stat-value">
								{formatFee(course.tuitionFee)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
