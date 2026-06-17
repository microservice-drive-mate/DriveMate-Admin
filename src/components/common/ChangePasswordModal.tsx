import { useState } from "react"
import { identityService } from "@/services"

interface ChangePasswordModalProps {
	onClose: () => void
	onSuccess: () => void
}

export function ChangePasswordModal({
	onClose,
	onSuccess,
}: ChangePasswordModalProps) {
	const [form, setForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirm: "",
	})
	const [error, setError] = useState("")
	const [saving, setSaving] = useState(false)

	const handleSave = async () => {
		if (!form.currentPassword) {
			setError("Vui lòng nhập mật khẩu hiện tại")
			return
		}
		if (form.newPassword.length < 8) {
			setError("Mật khẩu mới phải có ít nhất 8 ký tự")
			return
		}
		if (form.newPassword !== form.confirm) {
			setError("Xác nhận mật khẩu không khớp")
			return
		}
		setSaving(true)
		setError("")
		const res = await identityService.changePassword(
			form.currentPassword,
			form.newPassword,
		)
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
				<p className="user-modal__title">Đổi mật khẩu</p>
				{error && <div className="user-modal__error">{error}</div>}
				<div className="user-modal__field">
					<label>Mật khẩu hiện tại *</label>
					<input
						type="password"
						value={form.currentPassword}
						onChange={(e) =>
							setForm((f) => ({
								...f,
								currentPassword: e.target.value,
							}))
						}
						disabled={saving}
					/>
				</div>
				<div className="user-modal__field">
					<label>Mật khẩu mới * (tối thiểu 8 ký tự)</label>
					<input
						type="password"
						value={form.newPassword}
						onChange={(e) =>
							setForm((f) => ({
								...f,
								newPassword: e.target.value,
							}))
						}
						disabled={saving}
					/>
				</div>
				<div className="user-modal__field">
					<label>Xác nhận mật khẩu mới *</label>
					<input
						type="password"
						value={form.confirm}
						onChange={(e) =>
							setForm((f) => ({ ...f, confirm: e.target.value }))
						}
						disabled={saving}
					/>
				</div>
				<div className="user-modal__actions">
					<button
						className="user-modal__btn user-modal__btn--primary"
						onClick={handleSave}
						disabled={saving}
					>
						{saving ? "Đang lưu..." : "Đổi mật khẩu"}
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
