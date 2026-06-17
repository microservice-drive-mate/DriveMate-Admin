import { useState } from "react"
import { identityService } from "@/services"
import {
	getLockAccountErrorMessage,
	getLockAccountSuccessMessage,
} from "@/utils/srsMessages"
import type { Student } from "@/types/student.types"
import { Modal } from "./Modal"

interface LockAccountModalProps {
	student: Student
	onClose: () => void
	onToast: (message: string, type: "success" | "error") => void
	onStudentChange: (next: Student) => void
	onRefetch: () => void
}

export function LockAccountModal({
	student,
	onClose,
	onToast,
	onStudentChange,
	onRefetch,
}: LockAccountModalProps) {
	const [submitting, setSubmitting] = useState(false)

	const confirmLock = async () => {
		setSubmitting(true)
		const res = await identityService.setLock(student.id, true)
		setSubmitting(false)
		if (res.success) {
			onStudentChange({ ...student, isActive: false })
			onRefetch()
			onToast(getLockAccountSuccessMessage(true), "success")
			onClose()
		} else {
			onToast(getLockAccountErrorMessage(res), "error")
		}
	}

	return (
		<Modal
			title="Khóa tài khoản học viên"
			onClose={onClose}
			footer={
				<div className="detail-modal__footer">
					<button onClick={onClose}>Hủy</button>
					<button
						className="detail-modal__confirm detail-modal__confirm--red"
						onClick={confirmLock}
						disabled={submitting}
					>
						{submitting ? "Đang khóa..." : "Xác nhận khóa"}
					</button>
				</div>
			}
		>
			<p className="detail-modal__hint">
				<strong>{student.fullName}</strong> sẽ không thể đăng nhập sau
				khi bị khóa.
			</p>
		</Modal>
	)
}
