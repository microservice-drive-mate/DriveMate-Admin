import { useState } from "react";
import type { Gender } from "@/types/user-profile.types";
import type { MediaReference } from "@/types/media.types";
import { userService } from "@/services";
import { ImageUploader } from "@/components/common/ImageUploader";
import { validatePhoneNumber } from "@/utils/authUtils";
import { toDateInput } from "@/utils/format";
import {
	getUpdateAccountErrorMessage,
	getUpdateAccountSuccessMessage,
} from "@/utils/srsMessages";
import type { Student } from "@/types/student.types";
import { studentFromProfile } from "@/types/student.types";
import { Modal } from "./Modal";

interface ProfileForm {
	phoneNumber: string;
	dateOfBirth: string;
	gender: Gender | "";
	address: string;
	notes: string;
}

interface EditProfileModalProps {
	student: Student;
	onClose: () => void;
	onToast: (message: string, type: "success" | "error") => void;
	onStudentChange: (next: Student) => void;
}

export function EditProfileModal({
	student,
	onClose,
	onToast,
	onStudentChange,
}: EditProfileModalProps) {
	const [profileForm, setProfileForm] = useState<ProfileForm>({
		phoneNumber: student.phoneNumber ?? "",
		dateOfBirth: toDateInput(student.dateOfBirth),
		gender: student.gender ?? "",
		address: student.address ?? "",
		notes: student.notes ?? "",
	});
	const [profileAvatar, setProfileAvatar] = useState<MediaReference | null>(
		student.mediaFileId
			? {
					mediaFileId: student.mediaFileId,
					publicUrl: student.avatarUrl ?? "",
				}
			: null,
	);
	const [submitting, setSubmitting] = useState(false);

	const confirmEditProfile = async () => {
		if (!validatePhoneNumber(profileForm.phoneNumber)) {
			onToast("Số điện thoại không hợp lệ.", "error");
			return;
		}

		setSubmitting(true);
		const res = await userService.update(student.id, {
			phoneNumber: profileForm.phoneNumber.trim() || undefined,
			dateOfBirth: profileForm.dateOfBirth || undefined,
			gender: profileForm.gender || undefined,
			address: profileForm.address.trim() || undefined,
			notes: profileForm.notes.trim() || undefined,
			avatarUrl: profileAvatar?.publicUrl,
			mediaFileId: profileAvatar?.mediaFileId,
		});
		setSubmitting(false);

		if (res.success) {
			onStudentChange(studentFromProfile(res.data));
			onToast(getUpdateAccountSuccessMessage(), "success");
			onClose();
		} else {
			onToast(getUpdateAccountErrorMessage(res), "error");
		}
	};

	return (
		<Modal
			title="Sửa hồ sơ học viên"
			onClose={onClose}
			footer={
				<div className="detail-modal__footer">
					<button onClick={onClose}>Hủy</button>
					<button
						className="detail-modal__confirm detail-modal__confirm--green"
						onClick={confirmEditProfile}
						disabled={submitting}>
						{submitting ? "Đang lưu..." : "Lưu hồ sơ"}
					</button>
				</div>
			}>
			<div className="detail-modal__avatar-edit">
				<ImageUploader
					value={profileAvatar}
					onChange={setProfileAvatar}
					shape="circle"
					helpText="Tùy chọn - JPG, PNG, WebP"
					disabled={submitting}
				/>
			</div>
			<div className="detail-modal__grid">
				<div className="detail-modal__field">
					<label>Số điện thoại</label>
					<input
						value={profileForm.phoneNumber}
						onChange={(e) =>
							setProfileForm((current) => ({
								...current,
								phoneNumber: e.target.value,
							}))
						}
						placeholder="0901234567"
					/>
				</div>
				<div className="detail-modal__field">
					<label>Ngày sinh</label>
					<input
						type="date"
						value={profileForm.dateOfBirth}
						onChange={(e) =>
							setProfileForm((current) => ({
								...current,
								dateOfBirth: e.target.value,
							}))
						}
					/>
				</div>
				<div className="detail-modal__field">
					<label>Giới tính</label>
					<select
						value={profileForm.gender}
						onChange={(e) =>
							setProfileForm((current) => ({
								...current,
								gender: e.target.value as Gender | "",
							}))
						}>
						<option value="">Chọn giới tính</option>
						<option value="MALE">Nam</option>
						<option value="FEMALE">Nữ</option>
						<option value="OTHER">Khác</option>
					</select>
				</div>
				<div className="detail-modal__field">
					<label>Địa chỉ</label>
					<input
						value={profileForm.address}
						onChange={(e) =>
							setProfileForm((current) => ({
								...current,
								address: e.target.value,
							}))
						}
						placeholder="TP.HCM"
					/>
				</div>
			</div>
			<div className="detail-modal__field">
				<label>Ghi chú</label>
				<textarea
					value={profileForm.notes}
					onChange={(e) =>
						setProfileForm((current) => ({
							...current,
							notes: e.target.value,
						}))
					}
					placeholder="Ghi chú nội bộ về học viên..."
				/>
			</div>
		</Modal>
	);
}
