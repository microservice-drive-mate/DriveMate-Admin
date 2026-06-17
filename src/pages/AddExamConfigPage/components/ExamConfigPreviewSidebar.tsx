import type { ExamTemplateFormData } from "@/types/exam-template.types"

interface ExamConfigPreviewSidebarProps {
	form: ExamTemplateFormData
	isEdit: boolean
	version: number
	previewClass: string
	submitting: boolean
	onSubmit: () => void
	onCancel: () => void
}

export function ExamConfigPreviewSidebar({
	form,
	isEdit,
	version,
	previewClass,
	submitting,
	onSubmit,
	onCancel,
}: ExamConfigPreviewSidebarProps) {
	return (
		<div className="add-ec__sidebar">
			<div className="add-ec__preview-card">
				<div className="add-ec__preview-badge">{previewClass}</div>
				<div className="add-ec__preview-label">Hạng bằng lái</div>

				<div className="add-ec__preview-stats">
					<div className="add-ec__preview-stat">
						<span>Tổng câu hỏi:</span>
						<span>{form.totalQuestions} câu</span>
					</div>
					<div className="add-ec__preview-stat">
						<span>Điểm chuẩn:</span>
						<span className="add-ec__preview-stat--orange">
							{form.passingScore}/{form.totalQuestions}
						</span>
					</div>
					<div className="add-ec__preview-stat">
						<span>Câu điểm liệt:</span>
						<span>{form.criticalQuestions} câu</span>
					</div>
					<div className="add-ec__preview-stat">
						<span>Lỗi điểm liệt tối đa:</span>
						<span>{form.maxCriticalMistakes}</span>
					</div>
					<div className="add-ec__preview-stat">
						<span>Thời gian:</span>
						<span>{form.durationMinutes} phút</span>
					</div>
					<div className="add-ec__preview-stat">
						<span>Trộn câu hỏi:</span>
						<span>{form.shuffleQuestions ? "Có" : "Không"}</span>
					</div>
					{isEdit && (
						<div className="add-ec__preview-stat">
							<span>Phiên bản:</span>
							<span>v{version}</span>
						</div>
					)}
				</div>
			</div>

			<button
				className="add-ec__submit-btn"
				onClick={onSubmit}
				disabled={submitting}
			>
				<svg
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
					<polyline points="14 2 14 8 20 8" />
					<line x1="12" y1="18" x2="12" y2="12" />
					<line x1="9" y1="15" x2="15" y2="15" />
				</svg>
				{submitting
					? "Đang lưu..."
					: isEdit
						? "Lưu Thay Đổi"
						: "Tạo Đề Thi"}
			</button>
			<button className="add-ec__cancel-btn" onClick={onCancel}>
				Hủy
			</button>

			<div className="add-ec__guide">
				<div className="add-ec__guide-title">Hướng Dẫn</div>
				<ul className="add-ec__guide-list">
					<li>Điền đầy đủ các trường bắt buộc (*)</li>
					<li>Điểm chuẩn phải ≤ tổng số câu</li>
					<li>Thời gian từ 1 đến 180 phút</li>
					<li>
						Nếu có topic distribution, tổng câu = tổng số câu đề thi
					</li>
					<li>Hạng bằng không đổi được sau khi tạo</li>
				</ul>
			</div>
		</div>
	)
}
