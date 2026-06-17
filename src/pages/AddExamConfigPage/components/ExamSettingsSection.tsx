import type { ExamTemplateFormData } from "@/types/exam-template.types"
import type { ExamFormErrors } from "../hooks/useExamConfigForm"

interface ExamSettingsSectionProps {
	form: ExamTemplateFormData
	isEdit: boolean
	errors: ExamFormErrors
	onUpdate: (patch: Partial<ExamTemplateFormData>) => void
}

export function ExamSettingsSection({
	form,
	isEdit,
	errors,
	onUpdate,
}: ExamSettingsSectionProps) {
	return (
		<div className="add-ec__section">
			<div className="add-ec__section-title">Cài Đặt Bài Thi</div>
			<div className="add-ec__form-body">
				<div className="add-ec__form-row">
					<div className="add-ec__form-group">
						<label>
							Thời gian làm bài (phút){" "}
							<span className="add-ec__required">*</span>
						</label>
						<input
							type="number"
							min={1}
							max={180}
							value={form.durationMinutes}
							onChange={(e) =>
								onUpdate({
									durationMinutes: Number(e.target.value),
								})
							}
						/>
						<span className="add-ec__hint">Từ 1 đến 180 phút</span>
						{errors.durationMinutes && (
							<span
								className="add-ec__hint"
								style={{ color: "#ef4444" }}
							>
								{errors.durationMinutes}
							</span>
						)}
					</div>
					{isEdit && (
						<div className="add-ec__form-group">
							<label>Trạng thái</label>
							<select
								value={form.isActive ? "true" : "false"}
								onChange={(e) =>
									onUpdate({
										isActive: e.target.value === "true",
									})
								}
							>
								<option value="true">Đang áp dụng</option>
								<option value="false">Ngừng áp dụng</option>
							</select>
							<span className="add-ec__hint">
								Ngừng áp dụng để ẩn template khỏi danh sách thi
								của học viên
							</span>
						</div>
					)}
				</div>

				<div className="add-ec__warning">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
					<div>
						<strong>Lưu ý:</strong>
						<span>
							{" "}
							Câu hỏi điểm liệt phải được đánh dấu từ trước trong
							ngân hàng câu hỏi. Điều kiện đỗ: số câu đúng &gt;=
							điểm chuẩn VÀ số câu điểm liệt sai &lt;= lỗi điểm
							liệt tối đa.
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}
