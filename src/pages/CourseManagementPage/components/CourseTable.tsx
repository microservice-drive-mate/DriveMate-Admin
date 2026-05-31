import type { CourseResponse, CourseStatus } from "@/types/course.types";
import { COURSE_STATUS_LABELS } from "@/types/course.types";

const STATUS_PILL: Record<CourseStatus, string> = {
	ACTIVE: "course-pill--active",
	DRAFT: "course-pill--draft",
	ARCHIVED: "course-pill--archived",
};

function formatFee(fee: number) {
	return fee.toLocaleString("vi-VN") + "Ä‘";
}

interface CourseTableProps {
	courses: CourseResponse[];
	onView: (id: string) => void;
	onEdit: (id: string) => void;
}

export function CourseTable({ courses, onView, onEdit }: CourseTableProps) {
	if (!courses.length) {
		return <div className="course-empty">KhÃ´ng tÃ¬m tháº¥y khÃ³a há»c nÃ o.</div>;
	}

	return (
		<div className="course-table-wrap">
			<table className="course-table">
				<thead>
					<tr>
						<th>#</th>
						<th>TÃªn khÃ³a há»c</th>
						<th>Háº¡ng báº±ng</th>
						<th>Thá»i lÆ°á»£ng</th>
						<th>BÃ i há»c</th>
						<th>Há»c phÃ­</th>
						<th>Tráº¡ng thÃ¡i</th>
						<th>THAO TÃC</th>
					</tr>
				</thead>
				<tbody>
					{courses.map((course, index) => (
						<tr key={course.id}>
							<td className="course-table__num">{index + 1}</td>
							<td className="course-table__name">{course.title}</td>
							<td>
								<span className="course-badge">{course.licenseCategory}</span>
							</td>
							<td>{course.duration ?? "â€”"}</td>
							<td>
								<span className="course-table__icon-cell">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
										<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
									</svg>
									{course.totalLessons}
								</span>
							</td>
							<td className="course-table__fee">{formatFee(course.tuitionFee)}</td>
							<td>
								<span className={`course-pill ${STATUS_PILL[course.status]}`}>
									{COURSE_STATUS_LABELS[course.status]}
								</span>
							</td>
							<td>
								<div className="course-table__actions">
									<button className="course-btn-view" onClick={() => onView(course.id)}>
										<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
										Xem
									</button>
									<button className="course-btn-edit" onClick={() => onEdit(course.id)}>
										<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
										</svg>
										Sá»­a
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
