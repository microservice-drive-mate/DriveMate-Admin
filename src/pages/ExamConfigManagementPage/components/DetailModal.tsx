import type { ExamTemplate } from "@/types/exam-template.types";

export function DetailModal({
	template,
	onClose,
}: {
	template: ExamTemplate;
	onClose: () => void;
}) {
	const statusKey = template.isActive ? "active" : "inactive";
	const statusLabel = template.isActive ? "Đang áp dụng" : "Ngừng áp dụng";

	return (
		<div
			className="ec-modal-overlay"
			onClick={onClose}>
			<div
				className="ec-modal"
				onClick={(e) => e.stopPropagation()}>
				<div className="ec-modal__header">
					<div className="ec-modal__title-row">
						<div className="ec-modal__badge">
							{template.licenseCategory}
						</div>
						<div>
							<h2>{template.name}</h2>
							<span
								className={`ec-card__status ec-card__status--${statusKey}`}>
								{statusLabel}
							</span>
						</div>
					</div>
					<button
						className="ec-modal__close"
						onClick={onClose}>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2">
							<line
								x1="18"
								y1="6"
								x2="6"
								y2="18"
							/>
							<line
								x1="6"
								y1="6"
								x2="18"
								y2="18"
							/>
						</svg>
					</button>
				</div>

				<div className="ec-modal__section-title">Thông Tin Đề Thi</div>
				<div className="ec-modal__grid">
					<div className="ec-modal__item">
						<span className="ec-modal__item-label">
							Tổng số câu
						</span>
						<span className="ec-modal__item-value">
							{template.totalQuestions} câu
						</span>
					</div>
					<div className="ec-modal__item">
						<span className="ec-modal__item-label">Điểm chuẩn</span>
						<span className="ec-modal__item-value ec-modal__item-value--orange">
							{template.passingScore}/{template.totalQuestions}
						</span>
					</div>
					<div className="ec-modal__item">
						<span className="ec-modal__item-label">
							Thời gian làm bài
						</span>
						<span className="ec-modal__item-value">
							{template.durationMinutes} phút
						</span>
					</div>
					<div className="ec-modal__item">
						<span className="ec-modal__item-label">Phiên bản</span>
						<span className="ec-modal__item-value">
							v{template.version}
						</span>
					</div>
					<div className="ec-modal__item">
						<span className="ec-modal__item-label">Ngày tạo</span>
						<span className="ec-modal__item-value">
							{new Date(template.createdAt).toLocaleDateString(
								"vi-VN",
							)}
						</span>
					</div>
					<div className="ec-modal__item">
						<span className="ec-modal__item-label">
							Cập nhật cuối
						</span>
						<span className="ec-modal__item-value">
							{new Date(template.updatedAt).toLocaleDateString(
								"vi-VN",
							)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
