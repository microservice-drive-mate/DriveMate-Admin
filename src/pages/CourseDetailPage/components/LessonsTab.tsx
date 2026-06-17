import type { CourseLesson, CourseResponse } from "@/types/course.types"

interface LessonsTabProps {
	lessons: CourseResponse["lessons"]
	canManage: boolean
	deletingLesson: string | null
	onAdd: () => void
	onDelete: (lessonId: string) => void
	onEdit: (lesson: CourseLesson) => void
}

export function LessonsTab({
	lessons,
	canManage,
	deletingLesson,
	onAdd,
	onDelete,
	onEdit,
}: LessonsTabProps) {
	return (
		<div className="course-detail__section">
			<div className="course-detail__section-header course-detail__section-header--with-action">
				<span>Danh Sách Bài Học</span>
				{canManage && (
					<button className="course-detail__add-btn" onClick={onAdd}>
						+ Thêm bài học
					</button>
				)}
			</div>
			{lessons.length === 0 ? (
				<div className="course-detail__empty">Chưa có bài học nào.</div>
			) : (
				<div className="course-detail__lesson-list">
					{lessons.map((lesson) => (
						<div
							key={lesson.id}
							className="course-detail__lesson-row"
						>
							<div className="course-detail__lesson-num">
								{lesson.order}
							</div>
							<div className="course-detail__lesson-info">
								<div className="course-detail__lesson-title">
									{lesson.title}
								</div>
								{lesson.content && (
									<div className="course-detail__lesson-meta">
										{lesson.content.slice(0, 100)}
										{lesson.content.length > 100
											? "..."
											: ""}
									</div>
								)}
							</div>
							{canManage && (
								<div className="course-detail__lesson-actions">
									<button
										className="course-detail__schedule-edit"
										onClick={() => onEdit(lesson)}
										disabled={deletingLesson === lesson.id}
										title="Chỉnh sửa bài học"
									>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
										</svg>
									</button>
									<button
										className="course-detail__lesson-delete"
										onClick={() => onDelete(lesson.id)}
										disabled={deletingLesson === lesson.id}
										title="Xóa bài học"
									>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6l-1 14H6L5 6" />
											<path d="M10 11v6M14 11v6M9 6V4h6v2" />
										</svg>
									</button>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
