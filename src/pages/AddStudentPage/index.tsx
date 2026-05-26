import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { identityService, userService } from "@/services";
import type { Gender, LicenseTier } from "@/types/user-profile.types";
import { ImageUploader } from "@/components/common/ImageUploader";
import type { MediaReference } from "@/types/media.types";
import { validateEmail } from "../../utils/authUtils";
import {
	getCreateAccountErrorMessage,
	getCreateAccountSuccessMessage,
	getLicenseAssignmentErrorMessage,
	getUpdateAccountErrorMessage,
	SRS_MESSAGES,
} from "../../utils/srsMessages";
import Toast from "../../components/ui/Toast";
import { STUDENT_LICENSE_TIERS } from "../../types/student.types";
import "./AddStudentPage.css";

interface FormState {
	fullName: string;
	email: string;
	temporaryPassword: string;
	phoneNumber: string;
	dateOfBirth: string;
	address: string;
	gender: Gender | "";
	licenseTier: LicenseTier | "";
	notes: string;
}

interface FormErrors {
	fullName?: string;
	email?: string;
	temporaryPassword?: string;
	phoneNumber?: string;
	dateOfBirth?: string;
	address?: string;
	licenseTier?: string;
}

const EMPTY_FORM: FormState = {
	fullName: "",
	email: "",
	temporaryPassword: "",
	phoneNumber: "",
	dateOfBirth: "",
	address: "",
	gender: "",
	licenseTier: "",
	notes: "",
};

interface ToastState {
	message: string;
	type: "success" | "error";
	visible: boolean;
}

function Field({
	label,
	children,
	error,
}: {
	label: string;
	children: React.ReactNode;
	error?: string;
}) {
	return (
		<div className="add-student__field">
			<label>{label}</label>
			{children}
			{error && <span className="add-student__error">{error}</span>}
		</div>
	);
}

export default function AddStudentPage() {
	const navigate = useNavigate();
	const [form, setForm] = useState<FormState>(EMPTY_FORM);
	const [avatar, setAvatar] = useState<MediaReference | null>(null);
	const [errors, setErrors] = useState<FormErrors>({});
	const [loading, setLoading] = useState(false);
	const [toast, setToast] = useState<ToastState>({
		message: "",
		type: "success",
		visible: false,
	});

	const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
		setForm((current) => ({ ...current, [field]: value }));
		if (errors[field as keyof FormErrors]) {
			setErrors((current) => ({ ...current, [field]: undefined }));
		}
	};

	const showToast = (message: string, type: ToastState["type"]) => {
		setToast({ message, type, visible: true });
	};

	const completion = useMemo(() => {
		const required = [
			form.fullName,
			form.email,
			form.temporaryPassword,
			form.phoneNumber,
			form.dateOfBirth,
			form.address,
			form.licenseTier,
		];
		const filled = required.filter(Boolean).length;
		return Math.round((filled / required.length) * 100);
	}, [form]);

	const validate = (): boolean => {
		const next: FormErrors = {};

		if (!form.fullName.trim())
			next.fullName = SRS_MESSAGES.MSG08;
		if (!form.email.trim()) next.email = SRS_MESSAGES.MSG08;
		else if (!validateEmail(form.email))
			next.email = SRS_MESSAGES.MSG08;
		if (!form.temporaryPassword)
			next.temporaryPassword = SRS_MESSAGES.MSG08;
		else if (form.temporaryPassword.length < 8)
			next.temporaryPassword = SRS_MESSAGES.MSG08;
		if (form.phoneNumber && !/^[0-9]{9,11}$/.test(form.phoneNumber.replace(/\s+/g, "")))
			next.phoneNumber = SRS_MESSAGES.MSG08;
		if (!form.licenseTier) next.licenseTier = SRS_MESSAGES.MSG20;

		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;
		setLoading(true);

		// 1. Tạo identity user (role = STUDENT).
		const created = await identityService.create({
			email: form.email.trim(),
			fullName: form.fullName.trim(),
			role: "STUDENT",
			temporaryPassword: form.temporaryPassword,
		});

		if (!created.success) {
			setLoading(false);
			showToast(getCreateAccountErrorMessage(created, "student"), "error");
			return;
		}

		const userId = created.data.userId;

		// 2. Đợi user-service xử lý event tạo profile.
		const profile = await userService.getByIdWithRetry(userId);
		if (!profile.success) {
			setLoading(false);
			showToast(
				"Student account created successfully. Profile is still syncing. Please refresh the list later.",
				"error",
			);
			setTimeout(() => navigate("/students"), 2000);
			return;
		}

		// 3. Cập nhật profile fields nếu có.
		const hasExtra =
			form.phoneNumber.trim() ||
			form.dateOfBirth ||
			form.gender ||
			form.address.trim() ||
			form.notes.trim() ||
			avatar !== null;
		if (hasExtra) {
			const updateResult = await userService.update(userId, {
				phoneNumber: form.phoneNumber.trim() || undefined,
				dateOfBirth: form.dateOfBirth || undefined,
				gender: form.gender || undefined,
				address: form.address.trim() || undefined,
				notes: form.notes.trim() || undefined,
				avatarUrl: avatar?.publicUrl,
				mediaFileId: avatar?.mediaFileId,
			});
			if (!updateResult.success) {
				setLoading(false);
				showToast(
					`Student account created, but profile update failed: ${getUpdateAccountErrorMessage(updateResult, "student")}`,
					"error",
				);
				return;
			}
		}

		// 4. Gán license tier (bắt buộc cho student).
		if (form.licenseTier) {
			const licenseResult = await userService.assignLicenseTier(
				userId,
				form.licenseTier,
			);
			if (!licenseResult.success) {
				setLoading(false);
				showToast(
					`Student account created, but license assignment failed: ${getLicenseAssignmentErrorMessage(licenseResult)}`,
					"error",
				);
				return;
			}
		}

		setLoading(false);
		showToast(getCreateAccountSuccessMessage("student"), "success");
		setTimeout(() => navigate("/students"), 1500);
	};

	return (
		<div className="add-student">
			<Toast
				message={toast.message}
				type={toast.type}
				visible={toast.visible}
				onClose={() =>
					setToast((current) => ({ ...current, visible: false }))
				}
			/>

			<div className="add-student__header">
				<button
					className="add-student__back"
					onClick={() => navigate("/students")}>
					←
				</button>
				<div>
					<h1>Thêm Học Viên Mới</h1>
					<p>Tạo hồ sơ mới cho học viên trong hệ thống</p>
				</div>
			</div>

			<div className="add-student__layout">
				<div className="add-student__main">
					<section className="add-student__card">
						<div className="add-student__section-title">
							<span>1</span> Thông Tin Cơ Bản
						</div>
						<div className="add-student__grid add-student__grid--two">
							<Field
								label="Họ và tên *"
								error={errors.fullName}>
								<input
									value={form.fullName}
									onChange={(e) =>
										update("fullName", e.target.value)
									}
									placeholder="Nguyễn Văn An"
								/>
							</Field>
							<Field
								label="Email *"
								error={errors.email}>
								<input
									value={form.email}
									onChange={(e) => update("email", e.target.value)}
									placeholder="nguyenvanan@email.com"
								/>
							</Field>
							<Field
								label="Mật khẩu tạm thời *"
								error={errors.temporaryPassword}>
								<input
									type="password"
									value={form.temporaryPassword}
									onChange={(e) =>
										update("temporaryPassword", e.target.value)
									}
									placeholder="Tối thiểu 8 ký tự"
								/>
							</Field>
							<Field
								label="Số điện thoại"
								error={errors.phoneNumber}>
								<input
									value={form.phoneNumber}
									onChange={(e) =>
										update("phoneNumber", e.target.value)
									}
									placeholder="0901234567"
								/>
							</Field>
							<Field
								label="Ngày sinh"
								error={errors.dateOfBirth}>
								<input
									type="date"
									value={form.dateOfBirth}
									onChange={(e) =>
										update("dateOfBirth", e.target.value)
									}
								/>
							</Field>
							<Field label="Giới tính">
								<select
									value={form.gender}
									onChange={(e) =>
										update("gender", e.target.value as Gender | "")
									}>
									<option value="">Chọn giới tính</option>
									<option value="MALE">Nam</option>
									<option value="FEMALE">Nữ</option>
									<option value="OTHER">Khác</option>
								</select>
							</Field>
						</div>
						<Field
							label="Địa chỉ"
							error={errors.address}>
							<input
								value={form.address}
								onChange={(e) => update("address", e.target.value)}
								placeholder="123 Đường ABC, Quận 1, TP.HCM"
							/>
						</Field>
					</section>

					<section className="add-student__card">
						<div className="add-student__section-title">
							<span>2</span> Phân Hạng Đào Tạo
						</div>
						<div className="add-student__rank-list">
							{STUDENT_LICENSE_TIERS.map((tier) => (
								<button
									key={tier}
									className={
										form.licenseTier === tier
											? "add-student__rank add-student__rank--active"
											: "add-student__rank"
									}
									onClick={() => update("licenseTier", tier)}>
									{tier}
								</button>
							))}
						</div>
						{errors.licenseTier && (
							<div className="add-student__error">
								{errors.licenseTier}
							</div>
						)}
						<Field label="Ghi chú">
							<textarea
								value={form.notes}
								onChange={(e) => update("notes", e.target.value)}
								placeholder="Ghi chú nội bộ về học viên..."
							/>
						</Field>
					</section>
				</div>

				<aside className="add-student__sidebar">
					<section className="add-student__card">
						<div className="add-student__sidebar-title">
							Ảnh Đại Diện
						</div>
						<ImageUploader
							value={avatar}
							onChange={setAvatar}
							shape="circle"
							helpText="Tùy chọn — JPG, PNG, WebP"
						/>
					</section>

					<section className="add-student__card">
						<div className="add-student__sidebar-title">
							Trạng Thái & Ghi Chú
						</div>
						<div className="add-student__summary">
							<div>
								<span>Hạng đã chọn</span>
								<strong>
									{form.licenseTier || "Chưa chọn"}
								</strong>
							</div>
							<div>
								<span>Hoàn thiện thông tin</span>
								<strong>{completion}%</strong>
							</div>
						</div>
					</section>

					<section className="add-student__card">
						<div className="add-student__sidebar-title">Checklist</div>
						<ul className="add-student__checklist">
							<li
								className={
									form.fullName && form.email
										? "add-student__checklist--done"
										: ""
								}>
								Thông tin cá nhân
							</li>
							<li
								className={
									form.temporaryPassword
										? "add-student__checklist--done"
										: ""
								}>
								Mật khẩu tạm thời
							</li>
							<li
								className={
									form.licenseTier
										? "add-student__checklist--done"
										: ""
								}>
								Phân hạng đào tạo
							</li>
						</ul>
					</section>

					<button
						className="add-student__submit"
						onClick={handleSubmit}
						disabled={loading}>
						{loading ? "Đang tạo..." : "Tạo Mới"}
					</button>
					<button
						className="add-student__cancel"
						onClick={() => navigate("/students")}>
						Hủy
					</button>
				</aside>
			</div>
		</div>
	);
}
