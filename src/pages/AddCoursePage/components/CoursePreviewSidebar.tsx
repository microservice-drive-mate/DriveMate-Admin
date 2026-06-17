import type { CourseFormData } from "@/types/course.types"

interface CoursePreviewSidebarProps {
	form: CourseFormData
	loading: boolean
	isEdit: boolean
	onSubmit: () => void
	onCancel: () => void
}

export function CoursePreviewSidebar({
	form,
	loading,
	isEdit,
	onSubmit,
	onCancel,
}: CoursePreviewSidebarProps) {
	return (
		<div className="add-course__sidebar">
			<div className="add-course__sidebar-card">
				<div className="add-course__sidebar-title">Xem Trước</div>
				<div className="add-course__preview-badge">
					{form.licenseCategory || "—"}
				</div>
				<div className="add-course__preview-title">
					{form.title || "Tên khóa học"}
				</div>
				<div className="add-course__preview-stats">
					{form.courseCode.trim() && (
						<div className="add-course__preview-stat">
							<span>Mã khóa học:</span>
							<span>{form.courseCode.trim()}</span>
						</div>
					)}
					<div className="add-course__preview-stat">
						<span>Thời lượng:</span>
						<span>{form.duration || "—"}</span>
					</div>
					<div className="add-course__preview-stat">
						<span>Học phí:</span>
						<span>{form.tuitionFee.toLocaleString("vi-VN")}đ</span>
					</div>
					<div className="add-course__preview-stat">
						<span>Sức chứa:</span>
						<span>{form.capacity} học viên</span>
					</div>
				</div>
			</div>

			<button
				className="add-course__submit-btn"
				onClick={onSubmit}
				disabled={loading}
			>
				<svg
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
					<polyline points="17 21 17 13 7 13 7 21" />
					<polyline points="7 3 7 8 15 8" />
				</svg>
				{loading ? "Đang lưu..." : isEdit ? "Lưu Thay Đổi" : "Tạo Mới"}
			</button>
			<button
				className="add-course__cancel-btn"
				onClick={onCancel}
				disabled={loading}
			>
				Hủy
			</button>
		</div>
	)
}
