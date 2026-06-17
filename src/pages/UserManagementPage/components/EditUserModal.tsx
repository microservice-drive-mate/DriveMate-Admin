import { useEffect, useState } from "react"
import type { IdentityUser } from "@/types/identity.types"
import type {
	Gender,
	LicenseTier,
	UserProfile,
} from "@/types/user-profile.types"
import { LICENSE_TIERS } from "@/types/user-profile.types"
import type { MediaReference } from "@/types/media.types"
import { identityService, userService } from "@/services"
import { ImageUploader } from "@/components/common/ImageUploader"
import { validateEmail, validatePhoneNumber } from "@/utils/authUtils"
import { toDateInput } from "@/utils/format"
import {
	getLicenseAssignmentErrorMessage,
	getLicenseAssignmentSuccessMessage,
	getPartialSaveErrorMessage,
	getUpdateAccountErrorMessage,
	getUpdateAccountSuccessMessage,
	SRS_MESSAGES,
} from "@/utils/srsMessages"

interface AccountEditForm {
	email: string
	fullName: string
}

interface ProfileEditForm {
	phoneNumber: string
	dateOfBirth: string
	gender: Gender | ""
	address: string
	notes: string
}

const EMPTY_PROFILE_FORM: ProfileEditForm = {
	phoneNumber: "",
	dateOfBirth: "",
	gender: "",
	address: "",
	notes: "",
}

function profileToForm(profile: UserProfile): ProfileEditForm {
	return {
		phoneNumber: profile.phoneNumber ?? "",
		dateOfBirth: toDateInput(profile.dateOfBirth),
		gender: profile.gender ?? "",
		address: profile.address ?? "",
		notes: profile.studentDetail?.notes ?? "",
	}
}

function profileToAvatar(profile: UserProfile): MediaReference | null {
	if (!profile.mediaFileId) return null
	return {
		mediaFileId: profile.mediaFileId,
		publicUrl: profile.avatarUrl ?? "",
	}
}

interface EditUserModalProps {
	user: IdentityUser
	onClose: () => void
	/** Lưu thành công toàn bộ: parent đóng modal, hiện toast, tải lại danh sách. */
	onSaved: (message: string) => void
	/** Lưu thành công một phần: parent chỉ tải lại danh sách, modal vẫn mở. */
	onListChanged: () => void
}

export function EditUserModal({
	user,
	onClose,
	onSaved,
	onListChanged,
}: EditUserModalProps) {
	const [editForm, setEditForm] = useState<AccountEditForm>({
		email: user.email,
		fullName: user.fullName,
	})
	const [profileForm, setProfileForm] =
		useState<ProfileEditForm>(EMPTY_PROFILE_FORM)
	const [profileAvatar, setProfileAvatar] = useState<MediaReference | null>(
		null,
	)
	const [profileLicenseTier, setProfileLicenseTier] = useState<
		LicenseTier | ""
	>("")
	const [profileLoading, setProfileLoading] = useState(true)
	const [modalLoading, setModalLoading] = useState(false)
	const [modalError, setModalError] = useState<string | null>(null)

	const hydrateProfileForm = (profile: UserProfile) => {
		setProfileForm(profileToForm(profile))
		setProfileAvatar(profileToAvatar(profile))
		setProfileLicenseTier(profile.studentDetail?.licenseTier ?? "")
	}

	useEffect(() => {
		let active = true
		userService.getById(user.userId).then((result) => {
			if (!active) return
			if (result.success) {
				hydrateProfileForm(result.data)
			} else {
				setModalError(getUpdateAccountErrorMessage(result))
			}
			setProfileLoading(false)
		})
		return () => {
			active = false
		}
	}, [user.userId])

	const validateEdit = () => {
		if (!editForm.fullName.trim()) return SRS_MESSAGES.MSG13
		if (!editForm.email.trim()) return SRS_MESSAGES.MSG13
		if (!validateEmail(editForm.email.trim())) return SRS_MESSAGES.MSG13
		if (!validatePhoneNumber(profileForm.phoneNumber))
			return SRS_MESSAGES.MSG13
		return null
	}

	const refreshOpenProfile = async () => {
		const result = await userService.getById(user.userId)
		if (result.success) hydrateProfileForm(result.data)
	}

	const handleSubmit = async () => {
		const validationError = validateEdit()
		if (validationError) {
			setModalError(validationError)
			return
		}

		setModalLoading(true)
		setModalError(null)

		const identityResult = await identityService.update(user.userId, {
			email: editForm.email.trim(),
			fullName: editForm.fullName.trim(),
		})

		if (!identityResult.success) {
			setModalLoading(false)
			setModalError(getUpdateAccountErrorMessage(identityResult))
			return
		}
		setEditForm({
			email: identityResult.data.email,
			fullName: identityResult.data.fullName,
		})

		const profileResult = await userService.update(user.userId, {
			phoneNumber: profileForm.phoneNumber.trim() || undefined,
			dateOfBirth: profileForm.dateOfBirth || undefined,
			gender: profileForm.gender || undefined,
			address: profileForm.address.trim() || undefined,
			notes: profileForm.notes.trim() || undefined,
			avatarUrl: profileAvatar?.publicUrl,
			mediaFileId: profileAvatar?.mediaFileId,
		})

		if (!profileResult.success) {
			onListChanged()
			await refreshOpenProfile()
			setModalLoading(false)
			setModalError(
				getPartialSaveErrorMessage(
					getUpdateAccountErrorMessage(profileResult),
				),
			)
			return
		}
		hydrateProfileForm(profileResult.data)

		if (user.role === "STUDENT" && profileLicenseTier) {
			const licenseResult = await userService.assignLicenseTier(
				user.userId,
				profileLicenseTier,
			)
			if (!licenseResult.success) {
				onListChanged()
				await refreshOpenProfile()
				setModalLoading(false)
				setModalError(
					getPartialSaveErrorMessage(
						getLicenseAssignmentErrorMessage(licenseResult),
					),
				)
				return
			}
			hydrateProfileForm(licenseResult.data)
		}

		setModalLoading(false)
		onSaved(
			user.role === "STUDENT" && profileLicenseTier
				? `${getUpdateAccountSuccessMessage()} ${getLicenseAssignmentSuccessMessage()}`
				: getUpdateAccountSuccessMessage(),
		)
	}

	return (
		<div className="user-modal">
			<div className="user-modal__box user-modal__box--wide">
				<p className="user-modal__title">
					Sửa người dùng - {user.fullName}
				</p>
				{modalError && (
					<div className="user-modal__error">{modalError}</div>
				)}
				{profileLoading && (
					<div className="user-modal__loading">
						Đang tải profile...
					</div>
				)}

				<div className="user-modal__section">
					<h3>Account</h3>
					<div className="user-modal__grid">
						<div className="user-modal__field">
							<label>Họ và tên</label>
							<input
								value={editForm.fullName}
								onChange={(e) =>
									setEditForm((f) => ({
										...f,
										fullName: e.target.value,
									}))
								}
								placeholder="Nguyễn Văn A"
							/>
						</div>
						<div className="user-modal__field">
							<label>Email</label>
							<input
								type="email"
								value={editForm.email}
								onChange={(e) =>
									setEditForm((f) => ({
										...f,
										email: e.target.value,
									}))
								}
								placeholder="email@example.com"
							/>
						</div>
					</div>
				</div>

				<div className="user-modal__section">
					<h3>Profile</h3>
					<div className="user-modal__profile-layout">
						<div className="user-modal__avatar">
							<ImageUploader
								value={profileAvatar}
								onChange={setProfileAvatar}
								shape="circle"
								helpText="Tùy chọn - JPG, PNG, WebP"
								disabled={profileLoading || modalLoading}
							/>
						</div>
						<div className="user-modal__profile-fields">
							<div className="user-modal__grid">
								<div className="user-modal__field">
									<label>Số điện thoại</label>
									<input
										value={profileForm.phoneNumber}
										onChange={(e) =>
											setProfileForm((f) => ({
												...f,
												phoneNumber: e.target.value,
											}))
										}
										placeholder="0901234567"
									/>
								</div>
								<div className="user-modal__field">
									<label>Ngày sinh</label>
									<input
										type="date"
										value={profileForm.dateOfBirth}
										onChange={(e) =>
											setProfileForm((f) => ({
												...f,
												dateOfBirth: e.target.value,
											}))
										}
									/>
								</div>
								<div className="user-modal__field">
									<label>Giới tính</label>
									<select
										value={profileForm.gender}
										onChange={(e) =>
											setProfileForm((f) => ({
												...f,
												gender: e.target.value as
													| Gender
													| "",
											}))
										}
									>
										<option value="">Chọn giới tính</option>
										<option value="MALE">Nam</option>
										<option value="FEMALE">Nữ</option>
										<option value="OTHER">Khác</option>
									</select>
								</div>
								<div className="user-modal__field">
									<label>Địa chỉ</label>
									<input
										value={profileForm.address}
										onChange={(e) =>
											setProfileForm((f) => ({
												...f,
												address: e.target.value,
											}))
										}
										placeholder="TP.HCM"
									/>
								</div>
							</div>
							<div className="user-modal__field">
								<label>Ghi chú</label>
								<textarea
									value={profileForm.notes}
									onChange={(e) =>
										setProfileForm((f) => ({
											...f,
											notes: e.target.value,
										}))
									}
									placeholder="Ghi chú nội bộ..."
								/>
							</div>
						</div>
					</div>
				</div>

				{user.role === "STUDENT" && (
					<div className="user-modal__section">
						<h3>Học viên</h3>
						<div className="user-modal__field">
							<label>Hạng bằng lái</label>
							<select
								value={profileLicenseTier}
								onChange={(e) =>
									setProfileLicenseTier(
										e.target.value as LicenseTier | "",
									)
								}
							>
								<option value="">Chưa phân</option>
								{LICENSE_TIERS.map((tier) => (
									<option key={tier} value={tier}>
										Hạng {tier}
									</option>
								))}
							</select>
						</div>
					</div>
				)}

				<div className="user-modal__actions">
					<button
						className="user-modal__btn user-modal__btn--primary"
						onClick={handleSubmit}
						disabled={modalLoading || profileLoading}
					>
						{modalLoading ? "Đang lưu..." : "Lưu"}
					</button>
					<button
						className="user-modal__btn"
						onClick={onClose}
						disabled={modalLoading}
					>
						Hủy
					</button>
				</div>
			</div>
		</div>
	)
}
