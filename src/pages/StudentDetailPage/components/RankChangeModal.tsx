import { useState } from "react"
import type { LicenseTier } from "@/types/user-profile.types"
import { userService } from "@/services"
import {
	getLicenseAssignmentErrorMessage,
	getLicenseAssignmentSuccessMessage,
} from "@/utils/srsMessages"
import type { Student } from "@/types/student.types"
import { STUDENT_RANK_OPTIONS } from "@/types/student.types"
import { Modal } from "./Modal"

interface RankChangeModalProps {
	student: Student
	onClose: () => void
	onToast: (message: string, type: "success" | "error") => void
	onStudentChange: (next: Student) => void
	onRefetch: () => void
}

export function RankChangeModal({
	student,
	onClose,
	onToast,
	onStudentChange,
	onRefetch,
}: RankChangeModalProps) {
	const [rank, setRank] = useState<LicenseTier>(student.licenseTier ?? "B1")
	const [submitting, setSubmitting] = useState(false)

	const confirmRank = async () => {
		setSubmitting(true)
		const res = await userService.assignLicenseTier(student.id, rank)
		setSubmitting(false)
		if (res.success) {
			onStudentChange({ ...student, licenseTier: rank })
			onRefetch()
			onToast(getLicenseAssignmentSuccessMessage(), "success")
			onClose()
		} else {
			onToast(getLicenseAssignmentErrorMessage(res), "error")
		}
	}

	return (
		<Modal
			title="Phân hạng bằng lái"
			onClose={onClose}
			footer={
				<div className="detail-modal__footer">
					<button onClick={onClose}>Hủy</button>
					<button
						className="detail-modal__confirm detail-modal__confirm--yellow"
						onClick={confirmRank}
						disabled={submitting}
					>
						{submitting ? "Đang lưu..." : "Xác nhận phân hạng"}
					</button>
				</div>
			}
		>
			<p className="detail-modal__hint">
				Hạng hiện tại:{" "}
				<strong>{student.licenseTier ?? "Chưa phân"}</strong>
			</p>
			<div className="detail-modal__rank-list">
				{STUDENT_RANK_OPTIONS.map((option) => (
					<button
						key={option}
						className={
							option === rank
								? "detail-modal__rank detail-modal__rank--active"
								: "detail-modal__rank"
						}
						onClick={() => setRank(option)}
					>
						{option}
					</button>
				))}
			</div>
		</Modal>
	)
}
