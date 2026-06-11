import { useState } from "react";
import { notificationService } from "@/services";
import type { AcademicWarningSeverity } from "@/types/notification.types";
import { SEVERITY_LABELS } from "@/types/notification.types";
import type { Student } from "@/types/student.types";
import { STUDENT_ALERT_TEMPLATES } from "@/types/student.types";
import { Modal } from "./Modal";

interface AlertModalProps {
	student: Student;
	onClose: () => void;
	onToast: (message: string, type: "success" | "error") => void;
}

export function AlertModal({ student, onClose, onToast }: AlertModalProps) {
	const [alertTemplate, setAlertTemplate] = useState(STUDENT_ALERT_TEMPLATES[0]);
	const [alertContent, setAlertContent] = useState("");
	const [alertSeverity, setAlertSeverity] =
		useState<AcademicWarningSeverity>("MEDIUM");
	const [submitting, setSubmitting] = useState(false);

	const confirmAlert = async () => {
		if (!alertContent.trim()) {
			onToast("Vui lòng nhập nội dung cảnh báo.", "error");
			return;
		}
		setSubmitting(true);
		const res = await notificationService.sendAcademicWarning({
			studentId: student.id,
			reason: alertTemplate,
			severity: alertSeverity,
			message: alertContent.trim(),
		});
		setSubmitting(false);
		if (res.success) {
			onToast("Đã gửi cảnh báo học tập đến học viên.", "success");
			onClose();
		} else {
			onToast(`Gửi cảnh báo lỗi: ${res.error}`, "error");
		}
	};

	return (
		<Modal
			title="Gửi cảnh báo học tập"
			onClose={onClose}
			footer={
				<div className="detail-modal__footer">
					<button onClick={onClose}>Hủy</button>
					<button
						className="detail-modal__confirm detail-modal__confirm--green"
						onClick={confirmAlert}
						disabled={submitting}>
						{submitting ? "Đang gửi..." : "Gửi cảnh báo"}
					</button>
				</div>
			}>
			<div className="detail-modal__field">
				<label>Lý do cảnh báo</label>
				<div className="detail-modal__template-list">
					{STUDENT_ALERT_TEMPLATES.map((template) => (
						<button
							key={template}
							className={
								template === alertTemplate
									? "detail-modal__template detail-modal__template--active"
									: "detail-modal__template"
							}
							onClick={() => setAlertTemplate(template)}>
							{template}
						</button>
					))}
				</div>
			</div>
			<div className="detail-modal__field">
				<label>Mức độ nghiêm trọng</label>
				<select
					value={alertSeverity}
					onChange={(e) =>
						setAlertSeverity(e.target.value as AcademicWarningSeverity)
					}
					style={{
						width: "100%",
						padding: "8px 10px",
						background: "#2a2a2a",
						color: "#f0f0f0",
						border: "1px solid #3a3a3a",
						borderRadius: 8,
						fontSize: 14,
					}}>
					{(Object.keys(SEVERITY_LABELS) as AcademicWarningSeverity[]).map(
						(s) => (
							<option key={s} value={s}>
								{SEVERITY_LABELS[s]}
							</option>
						),
					)}
				</select>
			</div>
			<div className="detail-modal__field">
				<label>Nội dung cảnh báo *</label>
				<textarea
					value={alertContent}
					onChange={(e) => setAlertContent(e.target.value)}
					placeholder="Nhập nội dung cảnh báo cho học viên..."
				/>
			</div>
		</Modal>
	);
}
