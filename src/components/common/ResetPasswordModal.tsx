import { useState } from "react"
import { identityService } from "@/services"

interface ResetPasswordModalProps {
	userId: string
	userFullName: string
	onClose: () => void
	onSuccess: () => void
}

export function ResetPasswordModal({
	userId,
	userFullName,
	onClose,
	onSuccess,
}: ResetPasswordModalProps) {
	const [newPassword, setNewPassword] = useState("")
	const [confirm, setConfirm] = useState("")
	const [error, setError] = useState("")
	const [saving, setSaving] = useState(false)

	const handleSave = async () => {
		if (newPassword.length < 8) {
			setError("Mật khẩu phải có ít nhất 8 ký tự")
			return
		}
		if (newPassword !== confirm) {
			setError("Xác nhận mật khẩu không khớp")
			return
		}
		setSaving(true)
		setError("")
		const res = await identityService.resetPassword(userId, newPassword)
		setSaving(false)
		if (res.success) {
			onSuccess()
		} else {
			setError(res.error)
		}
	}

	return (
		<div className="user-modal">
			<div className="user-modal__box">
				<p className="user-modal__title">
					Đặt lại mật khẩu — {userFullName}
				</p>
				{error && <div className="user-modal__error">{error}</div>}
				<div className="user-modal__field">
					<label>Mật khẩu mới * (tối thiểu 8 ký tự)</label>
					<input
						type="password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						disabled={saving}
					/>
				</div>
				<div className="user-modal__field">
					<label>Xác nhận mật khẩu *</label>
					<input
						type="password"
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						disabled={saving}
					/>
				</div>
				<div className="user-modal__actions">
					<button
						className="user-modal__btn user-modal__btn--primary"
						onClick={handleSave}
						disabled={saving}
					>
						{saving ? "Đang lưu..." : "Đặt lại mật khẩu"}
					</button>
					<button
						className="user-modal__btn"
						onClick={onClose}
						disabled={saving}
					>
						Hủy
					</button>
				</div>
			</div>
		</div>
	)
}
