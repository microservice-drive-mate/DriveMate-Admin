import type { ExamTemplate } from "@/types/exam-template.types"

export function ExamConfigCard({
	template,
	onEdit,
	onView,
	onDelete,
	deleting,
}: {
	template: ExamTemplate
	onEdit: (id: string) => void
	onView: (template: ExamTemplate) => void
	onDelete: (template: ExamTemplate) => void
	deleting: boolean
}) {
	const statusKey = template.isActive ? "active" : "inactive"
	const statusLabel = template.isActive ? "Đang áp dụng" : "Ngừng áp dụng"

	return (
		<div className="ec-card">
			<div className="ec-card__top">
				<div className="ec-card__badge">{template.licenseCategory}</div>
				<div className="ec-card__info">
					<div className="ec-card__class-name">{template.name}</div>
					<span
						className={`ec-card__status ec-card__status--${statusKey}`}
					>
						{statusLabel}
					</span>
				</div>
			</div>

			<div className="ec-card__stats">
				<div className="ec-card__stat-row">
					<span className="ec-card__stat-label">Tổng số câu:</span>
					<span className="ec-card__stat-value">
						{template.totalQuestions} câu
					</span>
				</div>
				<div className="ec-card__stat-row">
					<span className="ec-card__stat-label">Điểm chuẩn:</span>
					<span className="ec-card__stat-value ec-card__stat-value--orange">
						{template.passingScore}/{template.totalQuestions}
					</span>
				</div>
				<div className="ec-card__stat-row">
					<span className="ec-card__stat-label">Thời gian:</span>
					<span className="ec-card__stat-value">
						{template.durationMinutes} phút
					</span>
				</div>
				<div className="ec-card__stat-row">
					<span className="ec-card__stat-label">Phiên bản:</span>
					<span className="ec-card__stat-value">
						v{template.version}
					</span>
				</div>
			</div>

			<div className="ec-card__actions">
				<button
					className="ec-card__btn-edit"
					onClick={() => onEdit(template.id)}
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
					Chỉnh Sửa
				</button>
				<button
					className="ec-card__btn-view"
					onClick={() => onView(template)}
					title="Xem chi tiết"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
						<polyline points="14 2 14 8 20 8" />
						<line x1="16" y1="13" x2="8" y2="13" />
						<line x1="16" y1="17" x2="8" y2="17" />
						<polyline points="10 9 9 9 8 9" />
					</svg>
				</button>
				<button
					className="ec-card__btn-view"
					onClick={() => onDelete(template)}
					disabled={deleting}
					title="Xóa"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
						<path d="M10 11v6M14 11v6" />
					</svg>
				</button>
			</div>
		</div>
	)
}
