import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { UserRole } from "@/types/identity.types"
import type { Gender, LicenseTier } from "@/types/user-profile.types"
import { LICENSE_TIERS } from "@/types/user-profile.types"
import { identityService, userService } from "@/services"
import { ImageUploader } from "@/components/common/ImageUploader"
import type { MediaReference } from "@/types/media.types"
import { validateEmail } from "../../utils/authUtils"
import {
	getCreateAccountErrorMessage,
	getCreateAccountPartialErrorMessage,
	getCreateAccountProfileSyncMessage,
	getCreateAccountSuccessMessage,
	getLicenseAssignmentErrorMessage,
	getUpdateAccountErrorMessage,
	SRS_MESSAGES,
} from "../../utils/srsMessages"
import Toast from "../../components/ui/Toast"
import "./AddUserPage.css"

interface FormState {
	fullName: string
	email: string
	temporaryPassword: string
	role: UserRole | ""
	phoneNumber: string
	dateOfBirth: string
	gender: Gender | ""
	address: string
	licenseTier: LicenseTier | ""
	notes: string
}

const EMPTY_FORM: FormState = {
	fullName: "",
	email: "",
	temporaryPassword: "",
	role: "",
	phoneNumber: "",
	dateOfBirth: "",
	gender: "",
	address: "",
	licenseTier: "",
	notes: "",
}

interface FormErrors {
	fullName?: string
	email?: string
	temporaryPassword?: string
	role?: string
	phoneNumber?: string
}

interface ToastState {
	message: string
	type: "success" | "error"
	visible: boolean
}

export default function AddUserPage() {
	const navigate = useNavigate()
	const [form, setForm] = useState<FormState>(EMPTY_FORM)
	const [avatar, setAvatar] = useState<MediaReference | null>(null)
	const [errors, setErrors] = useState<FormErrors>({})
	const [loading, setLoading] = useState(false)
	const [toast, setToast] = useState<ToastState>({
		message: "",
		type: "success",
		visible: false,
	})

	const update = <K extends keyof FormState>(
		field: K,
		value: FormState[K],
	) => {
		setForm((prev) => ({ ...prev, [field]: value }))
		if (errors[field as keyof FormErrors]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }))
		}
	}

	const showToast = (message: string, type: ToastState["type"]) => {
		setToast({ message, type, visible: true })
	}

	const validate = (): boolean => {
		const next: FormErrors = {}
		if (!form.fullName.trim()) next.fullName = SRS_MESSAGES.MSG08
		if (!form.email.trim()) {
			next.email = SRS_MESSAGES.MSG08
		} else if (!validateEmail(form.email)) {
			next.email = SRS_MESSAGES.MSG08
		}
		if (!form.temporaryPassword) {
			next.temporaryPassword = SRS_MESSAGES.MSG08
		} else if (form.temporaryPassword.length < 8) {
			next.temporaryPassword = SRS_MESSAGES.MSG08
		}
		if (
			form.phoneNumber.trim() &&
			!/^[0-9]{9,11}$/.test(form.phoneNumber.replace(/\s+/g, ""))
		) {
			next.phoneNumber = SRS_MESSAGES.MSG08
		}
		if (!form.role) next.role = SRS_MESSAGES.MSG08
		setErrors(next)
		return Object.keys(next).length === 0
	}

	const handleSubmit = async () => {
		if (!validate()) return
		setLoading(true)

		const created = await identityService.create({
			email: form.email.trim(),
			fullName: form.fullName.trim(),
			role: form.role as UserRole,
			temporaryPassword: form.temporaryPassword,
		})

		if (!created.success) {
			setLoading(false)
			showToast(getCreateAccountErrorMessage(created), "error")
			return
		}

		const userId = created.data.userId
		const profile = await userService.getByIdWithRetry(userId)
		if (!profile.success) {
			setLoading(false)
			showToast(getCreateAccountProfileSyncMessage(), "error")
			setTimeout(() => navigate("/users"), 2000)
			return
		}

		const hasExtra =
			form.phoneNumber.trim() ||
			form.dateOfBirth ||
			form.gender ||
			form.address.trim() ||
			(form.role === "STUDENT" && form.notes.trim()) ||
			avatar !== null

		if (hasExtra) {
			const updateResult = await userService.update(userId, {
				phoneNumber: form.phoneNumber.trim() || undefined,
				dateOfBirth: form.dateOfBirth || undefined,
				gender: form.gender || undefined,
				address: form.address.trim() || undefined,
				notes:
					form.role === "STUDENT"
						? form.notes.trim() || undefined
						: undefined,
				avatarUrl: avatar?.publicUrl,
				mediaFileId: avatar?.mediaFileId,
			})
			if (!updateResult.success) {
				setLoading(false)
				showToast(
					getCreateAccountPartialErrorMessage(
						"profile",
						getUpdateAccountErrorMessage(updateResult),
					),
					"error",
				)
				return
			}
		}

		if (form.role === "STUDENT" && form.licenseTier) {
			const licenseResult = await userService.assignLicenseTier(
				userId,
				form.licenseTier,
			)
			if (!licenseResult.success) {
				setLoading(false)
				showToast(
					getCreateAccountPartialErrorMessage(
						"license",
						getLicenseAssignmentErrorMessage(licenseResult),
					),
					"error",
				)
				return
			}
		}

		setLoading(false)
		showToast(getCreateAccountSuccessMessage(), "success")
		setTimeout(() => navigate("/users"), 1500)
	}

	return (
		<div className="add-user">
			<Toast
				message={toast.message}
				type={toast.type}
				visible={toast.visible}
				onClose={() =>
					setToast((prev) => ({ ...prev, visible: false }))
				}
			/>

			<button
				className="add-user__back"
				onClick={() => navigate("/users")}
			>
				← Quay lại
			</button>

			<div className="add-user__header">
				<h1>Thêm Người Dùng Mới</h1>
				<p>Tạo tài khoản mới cho hệ thống</p>
			</div>

			<div className="add-user__body">
				<div className="add-user__left">
					<div className="add-user__card">
						<h2 className="add-user__card-title">
							Thông Tin Cơ Bản
						</h2>

						<div className="add-user__field">
							<label className="add-user__label">Họ và tên</label>
							<input
								className={`add-user__input${errors.fullName ? " add-user__input--error" : ""}`}
								placeholder="Nguyễn Văn A"
								value={form.fullName}
								onChange={(e) =>
									update("fullName", e.target.value)
								}
							/>
							{errors.fullName && (
								<span className="add-user__error">
									{errors.fullName}
								</span>
							)}
						</div>

						<div className="add-user__field">
							<label className="add-user__label">Email</label>
							<input
								className={`add-user__input${errors.email ? " add-user__input--error" : ""}`}
								type="email"
								placeholder="nguyenvana@email.com"
								value={form.email}
								onChange={(e) =>
									update("email", e.target.value)
								}
							/>
							{errors.email && (
								<span className="add-user__error">
									{errors.email}
								</span>
							)}
						</div>

						<div className="add-user__field">
							<label className="add-user__label">
								Mật khẩu tạm thời
							</label>
							<input
								className={`add-user__input${errors.temporaryPassword ? " add-user__input--error" : ""}`}
								type="password"
								placeholder="Tối thiểu 8 ký tự"
								value={form.temporaryPassword}
								onChange={(e) =>
									update("temporaryPassword", e.target.value)
								}
							/>
							{errors.temporaryPassword && (
								<span className="add-user__error">
									{errors.temporaryPassword}
								</span>
							)}
						</div>

						<div className="add-user__field">
							<label className="add-user__label">
								Số điện thoại
							</label>
							<input
								className={`add-user__input${errors.phoneNumber ? " add-user__input--error" : ""}`}
								placeholder="0901234567"
								value={form.phoneNumber}
								onChange={(e) =>
									update("phoneNumber", e.target.value)
								}
							/>
							{errors.phoneNumber && (
								<span className="add-user__error">
									{errors.phoneNumber}
								</span>
							)}
						</div>

						<div className="add-user__row">
							<div className="add-user__field">
								<label className="add-user__label">
									Ngày sinh
								</label>
								<input
									className="add-user__input"
									type="date"
									value={form.dateOfBirth}
									onChange={(e) =>
										update("dateOfBirth", e.target.value)
									}
								/>
							</div>
							<div className="add-user__field">
								<label className="add-user__label">
									Giới tính
								</label>
								<select
									className="add-user__select"
									value={form.gender}
									onChange={(e) =>
										update(
											"gender",
											e.target.value as Gender | "",
										)
									}
								>
									<option value="">Chọn giới tính</option>
									<option value="MALE">Nam</option>
									<option value="FEMALE">Nữ</option>
									<option value="OTHER">Khác</option>
								</select>
							</div>
						</div>

						<div className="add-user__field">
							<label className="add-user__label">Địa chỉ</label>
							<input
								className="add-user__input"
								placeholder="TP.HCM"
								value={form.address}
								onChange={(e) =>
									update("address", e.target.value)
								}
							/>
						</div>
					</div>

					{form.role === "STUDENT" && (
						<div className="add-user__card">
							<h2 className="add-user__card-title">
								Hạng Bằng Lái
							</h2>
							<p
								style={{
									fontSize: 13,
									color: "#888",
									marginBottom: 16,
								}}
							>
								Chỉ áp dụng cho học viên
							</p>
							<div className="add-user__field">
								<label className="add-user__label">
									Hạng bằng lái
								</label>
								<select
									className="add-user__select"
									value={form.licenseTier}
									onChange={(e) =>
										update(
											"licenseTier",
											e.target.value as LicenseTier | "",
										)
									}
								>
									<option value="">Chọn hạng</option>
									{LICENSE_TIERS.map((tier) => (
										<option key={tier} value={tier}>
											Hạng {tier}
										</option>
									))}
								</select>
							</div>
							<div className="add-user__field">
								<label className="add-user__label">
									Ghi chú
								</label>
								<textarea
									className="add-user__input add-user__textarea"
									placeholder="Ghi chú nội bộ về học viên..."
									value={form.notes}
									onChange={(e) =>
										update("notes", e.target.value)
									}
								/>
							</div>
						</div>
					)}
				</div>

				<div className="add-user__right">
					<div className="add-user__card">
						<h2 className="add-user__card-title">Ảnh Đại Diện</h2>
						<ImageUploader
							value={avatar}
							onChange={setAvatar}
							shape="circle"
							helpText="Tùy chọn - JPG, PNG, WebP (tối đa 10MB)"
						/>
					</div>

					<div className="add-user__card">
						<h2 className="add-user__card-title">Vai Trò</h2>

						<div className="add-user__field">
							<label className="add-user__label">Vai trò</label>
							<select
								className={`add-user__select${errors.role ? " add-user__select--error" : ""}`}
								value={form.role}
								onChange={(e) =>
									update(
										"role",
										e.target.value as UserRole | "",
									)
								}
							>
								<option value="">Chọn vai trò</option>
								<option value="ADMIN">Admin</option>
								<option value="CENTER_MANAGER">
									Center Manager
								</option>
								<option value="INSTRUCTOR">Giảng viên</option>
								<option value="STUDENT">Học viên</option>
							</select>
							{errors.role && (
								<span className="add-user__error">
									{errors.role}
								</span>
							)}
						</div>
					</div>

					<button
						className="add-user__submit-btn"
						onClick={handleSubmit}
						disabled={loading}
					>
						{loading ? "Đang tạo..." : "Tạo Mới"}
					</button>

					<button
						className="add-user__cancel-btn"
						onClick={() => navigate("/users")}
						disabled={loading}
					>
						Hủy
					</button>
				</div>
			</div>
		</div>
	)
}
