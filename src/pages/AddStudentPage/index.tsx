import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/ui/Toast";
import {
	STUDENT_LICENSE_CLASSES,
	STUDENT_STATUS_OPTIONS,
} from "../../types/student.types";
import type {
	StudentFormData,
	StudentFormErrors,
} from "../../types/student.types";
import "./AddStudentPage.css";

const EMPTY_FORM: StudentFormData = {
	fullName: "",
	email: "",
	phone: "",
	dateOfBirth: "",
	address: "",
	enrollmentDate: "",
	licenseClass: "",
	status: "studying",
	note: "",
};

function UploadBox({
	label,
	hint,
	file,
	onChange,
	error,
}: {
	label: string;
	hint: string;
	file: File | null;
	onChange: (file: File | null) => void;
	error?: string;
}) {
	return (
		<label
			className={`add-student__upload${error ? " add-student__upload--error" : ""}`}>
			<input
				type="file"
				accept=".jpg,.jpeg,.png,.pdf"
				onChange={(e) => onChange(e.target.files?.[0] ?? null)}
			/>
			<span className="add-student__upload-label">{label}</span>
			<span className="add-student__upload-hint">
				{file ? file.name : hint}
			</span>
			<span className="add-student__upload-action">Nhấn để tải lên</span>
			{error && (
				<span className="add-student__upload-error">{error}</span>
			)}
		</label>
	);
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
	const [form, setForm] = useState<StudentFormData>(EMPTY_FORM);
	const [errors, setErrors] = useState<StudentFormErrors>({});
	const [loading, setLoading] = useState(false);
	const [toastVisible, setToastVisible] = useState(false);
	const [idFront, setIdFront] = useState<File | null>(null);
	const [idBack, setIdBack] = useState<File | null>(null);
	const [portrait, setPortrait] = useState<File | null>(null);
	const [healthCertificate, setHealthCertificate] = useState<File | null>(
		null,
	);
	const [extraDocs, setExtraDocs] = useState<File | null>(null);

	const update = (field: keyof StudentFormData, value: string) => {
		setForm((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	};

	const completion = useMemo(() => {
		const required = [
			form.fullName,
			form.email,
			form.phone,
			form.dateOfBirth,
			form.address,
			form.enrollmentDate,
			form.licenseClass,
			form.status,
		];
		const docs = [idFront, idBack, portrait, healthCertificate];
		const filled =
			required.filter(Boolean).length + docs.filter(Boolean).length;
		return Math.round((filled / 12) * 100);
	}, [form, idBack, idFront, healthCertificate, portrait]);

	const validate = (): boolean => {
		const next: StudentFormErrors = {};

		if (!form.fullName.trim())
			next.fullName = "Vui lòng nhập họ và tên học viên.";
		if (!form.email.trim()) next.email = "Vui lòng nhập email.";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
			next.email = "Email không hợp lệ.";
		if (!form.phone.trim()) next.phone = "Vui lòng nhập số điện thoại.";
		else if (!/^[0-9]{9,11}$/.test(form.phone.replace(/\s+/g, "")))
			next.phone = "Số điện thoại không hợp lệ.";
		if (!form.dateOfBirth) next.dateOfBirth = "Vui lòng chọn ngày sinh.";
		if (!form.address.trim()) next.address = "Vui lòng nhập địa chỉ.";
		if (!form.enrollmentDate)
			next.enrollmentDate = "Vui lòng chọn ngày đăng ký.";
		if (!form.licenseClass) next.licenseClass = "Vui lòng chọn hạng bằng.";
		if (!form.status) next.status = "Vui lòng chọn trạng thái.";

		if (!idFront) next.idFront = "Bắt buộc tải lên mặt trước.";
		if (!idBack) next.idBack = "Bắt buộc tải lên mặt sau.";
		if (!portrait) next.portrait = "Bắt buộc tải lên ảnh chân dung.";
		if (!healthCertificate)
			next.healthCertificate = "Bắt buộc tải lên giấy khám sức khỏe.";

		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;
		setLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 800));
		setLoading(false);
		setToastVisible(true);
		setTimeout(() => navigate("/students"), 1200);
	};

	return (
		<div className="add-student">
			<Toast
				message="Tạo học viên thành công!"
				type="success"
				visible={toastVisible}
				onClose={() => setToastVisible(false)}
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
								label="Họ và tên"
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
								label="Email"
								error={errors.email}>
								<input
									value={form.email}
									onChange={(e) =>
										update("email", e.target.value)
									}
									placeholder="nguyenvanan@email.com"
								/>
							</Field>
							<Field
								label="Số điện thoại"
								error={errors.phone}>
								<input
									value={form.phone}
									onChange={(e) =>
										update("phone", e.target.value)
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
						</div>
						<Field
							label="Địa chỉ"
							error={errors.address}>
							<input
								value={form.address}
								onChange={(e) =>
									update("address", e.target.value)
								}
								placeholder="123 Đường ABC, Quận 1, TP.HCM"
							/>
						</Field>
					</section>

					<section className="add-student__card">
						<div className="add-student__section-title">
							<span>2</span> Phân Hạng Đào Tạo
						</div>
						<div className="add-student__rank-list">
							{STUDENT_LICENSE_CLASSES.map((cls) => (
								<button
									key={cls}
									className={
										form.licenseClass === cls
											? "add-student__rank add-student__rank--active"
											: "add-student__rank"
									}
									onClick={() => update("licenseClass", cls)}>
									{cls}
								</button>
							))}
						</div>
						{errors.licenseClass && (
							<div className="add-student__error">
								{errors.licenseClass}
							</div>
						)}
						<div className="add-student__grid add-student__grid--two">
							<Field
								label="Ngày đăng ký"
								error={errors.enrollmentDate}>
								<input
									type="date"
									value={form.enrollmentDate}
									onChange={(e) =>
										update("enrollmentDate", e.target.value)
									}
								/>
							</Field>
							<Field
								label="Trạng thái"
								error={errors.status}>
								<select
									value={form.status}
									onChange={(e) =>
										update("status", e.target.value)
									}>
									{STUDENT_STATUS_OPTIONS.map((item) => (
										<option
											key={item.value}
											value={item.value}>
											{item.label}
										</option>
									))}
								</select>
							</Field>
						</div>
						<Field label="Ghi chú">
							<textarea
								value={form.note}
								onChange={(e) => update("note", e.target.value)}
								placeholder="Ghi chú nội bộ về học viên..."
							/>
						</Field>
					</section>

					<section className="add-student__card">
						<div className="add-student__section-title">
							<span>3</span> Hồ Sơ Học Viên
						</div>
						<div className="add-student__docs-grid">
							<UploadBox
								label="Mặt trước"
								hint="JPG, PNG - tối đa 5MB"
								file={idFront}
								onChange={setIdFront}
								error={errors.idFront}
							/>
							<UploadBox
								label="Mặt sau"
								hint="JPG, PNG - tối đa 5MB"
								file={idBack}
								onChange={setIdBack}
								error={errors.idBack}
							/>
							<UploadBox
								label="Ảnh chân dung"
								hint="JPG, PNG - tối đa 2MB"
								file={portrait}
								onChange={setPortrait}
								error={errors.portrait}
							/>
							<UploadBox
								label="Giấy khám sức khỏe"
								hint="PDF, JPG - tối đa 5MB"
								file={healthCertificate}
								onChange={setHealthCertificate}
								error={errors.healthCertificate}
							/>
							<UploadBox
								label="Tài liệu khác"
								hint="PDF, JPG, PNG - tối đa 10MB"
								file={extraDocs}
								onChange={setExtraDocs}
							/>
						</div>
					</section>
				</div>

				<aside className="add-student__sidebar">
					<section className="add-student__card">
						<div className="add-student__sidebar-title">
							Trạng Thái & Ghi Chú
						</div>
						<div className="add-student__summary">
							<div>
								<span>Hạng đã chọn</span>
								<strong>
									{form.licenseClass || "Chưa chọn"}
								</strong>
							</div>
							<div>
								<span>Trạng thái</span>
								<strong>
									{STUDENT_STATUS_OPTIONS.find(
										(item) => item.value === form.status,
									)?.label ?? "Chưa chọn"}
								</strong>
							</div>
							<div>
								<span>Hoàn thiện hồ sơ</span>
								<strong>{completion}%</strong>
							</div>
						</div>
					</section>

					<section className="add-student__card">
						<div className="add-student__sidebar-title">
							Checklist
						</div>
						<ul className="add-student__checklist">
							<li
								className={
									form.fullName
										? "add-student__checklist--done"
										: ""
								}>
								Thông tin cá nhân
							</li>
							<li
								className={
									form.licenseClass
										? "add-student__checklist--done"
										: ""
								}>
								Phân hạng đào tạo
							</li>
							<li
								className={
									idFront && idBack && portrait
										? "add-student__checklist--done"
										: ""
								}>
								Hồ sơ bắt buộc
							</li>
							<li
								className={
									healthCertificate
										? "add-student__checklist--done"
										: ""
								}>
								Giấy khám sức khỏe
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
