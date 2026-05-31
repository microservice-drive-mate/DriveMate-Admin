import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { analyticsService, examService, identityService, notificationService, userService } from "@/services";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { Gender, LicenseTier } from "@/types/user-profile.types";
import { GENDER_LABELS } from "@/types/user-profile.types";
import { ImageUploader } from "@/components/common/ImageUploader";
import type { MediaReference } from "@/types/media.types";
import type { AdminExamSession } from "@/types/exam-session.types";
import type { AcademicWarningSeverity } from "@/types/notification.types";
import { SEVERITY_LABELS } from "@/types/notification.types";
import type { ProgressDashboard } from "@/types/analytics.types";
import {
	getLicenseAssignmentErrorMessage,
	getLicenseAssignmentSuccessMessage,
	getLockAccountErrorMessage,
	getLockAccountSuccessMessage,
	getUpdateAccountErrorMessage,
	getUpdateAccountSuccessMessage,
} from "@/utils/srsMessages";
import Toast from "../../components/ui/Toast";
import {
	STUDENT_ALERT_TEMPLATES,
	STUDENT_RANK_OPTIONS,
	studentFromProfile,
	studentStatus,
} from "../../types/student.types";
import type { Student } from "../../types/student.types";
import { Badge } from "./components/Badge";
import { DetailAvatar } from "./components/DetailAvatar";
import { ExamSessionTable } from "./components/ExamSessionTable";
import { InlineButton } from "./components/InlineButton";
import { Modal } from "./components/Modal";
import "./StudentDetailPage.css";

type ModalType = "edit" | "rank" | "alert" | "lock" | null;

interface ProfileForm {
	phoneNumber: string;
	dateOfBirth: string;
	gender: Gender | "";
	address: string;
	notes: string;
}

const EMPTY_PROFILE_FORM: ProfileForm = {
	phoneNumber: "",
	dateOfBirth: "",
	gender: "",
	address: "",
	notes: "",
};

function toDateInput(value: string | null | undefined) {
	return value ? value.slice(0, 10) : "";
}

export default function StudentDetailPage() {
	const navigate = useNavigate();
	const { studentId } = useParams();
	const [modal, setModal] = useState<ModalType>(null);
	const [profileForm, setProfileForm] =
		useState<ProfileForm>(EMPTY_PROFILE_FORM);
	const [profileAvatar, setProfileAvatar] = useState<MediaReference | null>(null);
	const [rank, setRank] = useState<LicenseTier>("B1");
	const [alertTemplate, setAlertTemplate] = useState(STUDENT_ALERT_TEMPLATES[0]);
	const [alertContent, setAlertContent] = useState("");
	const [alertSeverity, setAlertSeverity] = useState<AcademicWarningSeverity>("MEDIUM");
	const [toastMessage, setToastMessage] = useState("");
	const [toastType, setToastType] = useState<"success" | "error">("success");
	const [toastVisible, setToastVisible] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const loadStudent = useCallback(async () => {
		if (!studentId) {
			return { success: true as const, data: null };
		}
		const res = await userService.getById(studentId);
		if (!res.success) return res;
		return { success: true as const, data: studentFromProfile(res.data) };
	}, [studentId]);
	const studentQuery = useAsyncData<Student | null>(loadStudent, {
		initialData: null,
		enabled: Boolean(studentId),
		retainPreviousData: false,
	});

	const loadExamSessions = useCallback(async () => {
		if (!studentId) {
			return { success: true as const, data: [] as AdminExamSession[] };
		}
		const res = await examService.listSessions({ studentId, size: 20 });
		if (!res.success) return res;
		return { success: true as const, data: res.data.items };
	}, [studentId]);
	const examSessionsQuery = useAsyncData(loadExamSessions, {
		initialData: [] as AdminExamSession[],
		enabled: Boolean(studentId),
		retainPreviousData: false,
	});

	const loadAnalytics = useCallback(async () => {
		if (!studentId) {
			return { success: true as const, data: null };
		}
		const res = await analyticsService.getStudentProgress(studentId);
		if (!res.success) return { success: true as const, data: null };
		return { success: true as const, data: res.data };
	}, [studentId]);
	const analyticsQuery = useAsyncData<ProgressDashboard | null>(loadAnalytics, {
		initialData: null,
		enabled: Boolean(studentId),
		retainPreviousData: false,
	});

	const showToast = (message: string, type: "success" | "error") => {
		setToastMessage(message);
		setToastType(type);
		setToastVisible(true);
	};

	const student = studentQuery.data;
	const error = studentQuery.error ?? "";
	const examSessions = examSessionsQuery.data;
	const analytics = analyticsQuery.data;

	if (studentQuery.loading) {
		return <div className="detail-empty">Đang tải hồ sơ học viên...</div>;
	}

	if (error || !student) {
		return (
			<div className="detail-empty">
				<h1>{error || "Không tìm thấy hồ sơ học viên"}</h1>
				<button onClick={() => navigate("/students")}>
					← Quay lại danh sách
				</button>
			</div>
		);
	}

	const status = studentStatus(student);

	const openEditModal = () => {
		setProfileForm({
			phoneNumber: student.phoneNumber ?? "",
			dateOfBirth: toDateInput(student.dateOfBirth),
			gender: student.gender ?? "",
			address: student.address ?? "",
			notes: student.notes ?? "",
		});
		setProfileAvatar(
			student.mediaFileId
				? {
						mediaFileId: student.mediaFileId,
						publicUrl: student.avatarUrl ?? "",
					}
				: null,
		);
		setModal("edit");
	};

	const openRankModal = () => {
		setRank(student.licenseTier ?? "B1");
		setModal("rank");
	};

	const openAlertModal = () => {
		setAlertTemplate(STUDENT_ALERT_TEMPLATES[0]);
		setAlertContent("");
		setAlertSeverity("MEDIUM");
		setModal("alert");
	};

	const openLockModal = () => {
		setModal("lock");
	};

	const confirmRank = async () => {
		setSubmitting(true);
		const res = await userService.assignLicenseTier(student.id, rank);
		setSubmitting(false);
		if (res.success) {
			studentQuery.setData({ ...student, licenseTier: rank });
			studentQuery.refetch();
			showToast(getLicenseAssignmentSuccessMessage(), "success");
			setModal(null);
		} else {
			showToast(getLicenseAssignmentErrorMessage(res), "error");
		}
	};

	const confirmEditProfile = async () => {
		const normalizedPhone = profileForm.phoneNumber.replace(/\s+/g, "");
		if (normalizedPhone && !/^[0-9]{9,11}$/.test(normalizedPhone)) {
			showToast("Số điện thoại không hợp lệ.", "error");
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
			studentQuery.setData(studentFromProfile(res.data));
			showToast(getUpdateAccountSuccessMessage(), "success");
			setModal(null);
		} else {
			showToast(getUpdateAccountErrorMessage(res), "error");
		}
	};

	const confirmAlert = async () => {
		if (!alertContent.trim()) {
			showToast("Vui lòng nhập nội dung cảnh báo.", "error");
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
			showToast("Đã gửi cảnh báo học tập đến học viên.", "success");
			setModal(null);
		} else {
			showToast(`Gửi cảnh báo lỗi: ${res.error}`, "error");
		}
	};

	const confirmLock = async () => {
		setSubmitting(true);
		const res = await identityService.setLock(student.id, true);
		setSubmitting(false);
		if (res.success) {
			studentQuery.setData({ ...student, isActive: false });
			studentQuery.refetch();
			showToast(getLockAccountSuccessMessage(true), "success");
			setModal(null);
		} else {
			showToast(getLockAccountErrorMessage(res), "error");
		}
	};

	const handleUnlock = async () => {
		if (!window.confirm("Mở khóa tài khoản học viên này?")) return;
		setSubmitting(true);
		const res = await identityService.setLock(student.id, false);
		setSubmitting(false);
		if (res.success) {
			studentQuery.setData({ ...student, isActive: true });
			studentQuery.refetch();
			showToast(getLockAccountSuccessMessage(false), "success");
		} else {
			showToast(getLockAccountErrorMessage(res), "error");
		}
	};

	return (
		<div className="student-detail">
			<Toast
				message={toastMessage}
				type={toastType}
				visible={toastVisible}
				onClose={() => setToastVisible(false)}
			/>

			<div className="student-detail__topbar">
				<button
					className="student-detail__back"
					onClick={() => navigate("/students")}>
					←
				</button>
				<div>
					<h1>Hồ Sơ Học Viên</h1>
					<p>Thông tin chi tiết</p>
				</div>
				<div className="student-detail__actions">
					<InlineButton
						tone="green"
						onClick={openEditModal}
						disabled={submitting}>
						Sửa Hồ Sơ
					</InlineButton>
					<InlineButton
						tone="yellow"
						onClick={openRankModal}
						disabled={submitting}>
						Phân Hạng Bằng
					</InlineButton>
					<InlineButton
						tone="green"
						onClick={openAlertModal}
						disabled={submitting}>
						Gửi Cảnh Báo
					</InlineButton>
					{student.isActive ? (
						<InlineButton
							tone="red"
							onClick={openLockModal}
							disabled={submitting}>
							Khóa TK
						</InlineButton>
					) : (
						<InlineButton
							tone="green"
							onClick={handleUnlock}
							disabled={submitting}>
							Mở Khóa
						</InlineButton>
					)}
				</div>
			</div>

			<div className="student-detail__grid">
				<aside className="student-detail__profile card-surface">
					<DetailAvatar student={student} />
					<div className="student-detail__name">
						{student.fullName}
					</div>
					<Badge status={status} />
					<div className="student-detail__info">
						<div>✉ {student.email}</div>
						<div>☎ {student.phoneNumber ?? "—"}</div>
						<div>
							📅 Sinh:{" "}
							{student.dateOfBirth
								? new Date(student.dateOfBirth).toLocaleDateString("vi-VN")
								: "—"}
						</div>
						<div>
							⚥ {student.gender ? GENDER_LABELS[student.gender] : "—"}
						</div>
						<div>
							🏷 Hạng {student.licenseTier ?? "Chưa phân"}
						</div>
					</div>
					<div className="student-detail__divider" />
					<div className="student-detail__label">Địa chỉ</div>
					<div>{student.address ?? "—"}</div>
					<div className="student-detail__divider" />
					<div className="student-detail__label">Ngày nhập học</div>
					<div>
						{student.enrolledAt
							? new Date(student.enrolledAt).toLocaleDateString("vi-VN")
							: "—"}
					</div>
					{student.notes && (
						<>
							<div className="student-detail__divider" />
							<div className="student-detail__label">Ghi chú</div>
							<div>{student.notes}</div>
						</>
					)}
				</aside>

				<section className="student-detail__content">
					{analytics && (
						<div className="card-surface student-detail__chart-card" style={{ marginBottom: 16 }}>
							<h2>Tiến Độ Học Tập</h2>
							<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 12 }}>
								{[
									{ label: "Hoàn thành khoá học", value: `${analytics.completionPct}%` },
									{ label: "Lượt thi", value: analytics.attemptCount },
									{ label: "Tỉ lệ đỗ", value: `${analytics.passRate}%` },
									{ label: "Điểm trung bình", value: analytics.avgExamScore },
								].map((stat) => (
									<div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px" }}>
										<div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{stat.label}</div>
										<div style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0" }}>{stat.value}</div>
									</div>
								))}
							</div>
							{analytics.weakTopics.length > 0 && (
								<div style={{ marginTop: 14 }}>
									<div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Topic yếu</div>
									{analytics.weakTopics.map((t) => (
										<div key={t.topicId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
											<span>{t.topicName}</span>
											<span style={{ color: "#f87171" }}>{Math.round(t.accuracyRate * 100)}% chính xác</span>
										</div>
									))}
								</div>
							)}
						</div>
					)}
					<div className="card-surface student-detail__chart-card">
						<h2>Lịch Sử Thi</h2>
						{examSessionsQuery.loading ? (
							<p style={{ color: "rgba(255,255,255,0.4)", padding: "16px 0" }}>Đang tải...</p>
						) : (
							<ExamSessionTable sessions={examSessions} />
						)}
					</div>
				</section>
			</div>

			{modal === "edit" && (
				<Modal
					title="Sửa hồ sơ học viên"
					onClose={() => setModal(null)}
					footer={
						<div className="detail-modal__footer">
							<button onClick={() => setModal(null)}>Hủy</button>
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
			)}

			{modal === "rank" && (
				<Modal
					title="Phân hạng bằng lái"
					onClose={() => setModal(null)}
					footer={
						<div className="detail-modal__footer">
							<button onClick={() => setModal(null)}>Hủy</button>
							<button
								className="detail-modal__confirm detail-modal__confirm--yellow"
								onClick={confirmRank}
								disabled={submitting}>
								{submitting ? "Đang lưu..." : "Xác nhận phân hạng"}
							</button>
						</div>
					}>
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
								onClick={() => setRank(option)}>
								{option}
							</button>
						))}
					</div>
				</Modal>
			)}

			{modal === "alert" && (
				<Modal
					title="Gửi cảnh báo học tập"
					onClose={() => setModal(null)}
					footer={
						<div className="detail-modal__footer">
							<button onClick={() => setModal(null)}>Hủy</button>
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
							onChange={(e) => setAlertSeverity(e.target.value as AcademicWarningSeverity)}
							style={{ width: "100%", padding: "8px 10px", background: "#2a2a2a", color: "#f0f0f0", border: "1px solid #3a3a3a", borderRadius: 8, fontSize: 14 }}
						>
							{(Object.keys(SEVERITY_LABELS) as AcademicWarningSeverity[]).map((s) => (
								<option key={s} value={s}>{SEVERITY_LABELS[s]}</option>
							))}
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
			)}

			{modal === "lock" && (
				<Modal
					title="Khóa tài khoản học viên"
					onClose={() => setModal(null)}
					footer={
						<div className="detail-modal__footer">
							<button onClick={() => setModal(null)}>Hủy</button>
							<button
								className="detail-modal__confirm detail-modal__confirm--red"
								onClick={confirmLock}
								disabled={submitting}>
								{submitting ? "Đang khóa..." : "Xác nhận khóa"}
							</button>
						</div>
					}>
					<p className="detail-modal__hint">
						<strong>{student.fullName}</strong> sẽ không thể đăng nhập
						sau khi bị khóa.
					</p>
				</Modal>
			)}
		</div>
	);
}
