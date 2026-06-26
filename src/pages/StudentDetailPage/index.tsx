import { useCallback, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
	analyticsService,
	courseService,
	examService,
	identityService,
	userService,
} from "@/services"
import { useAsyncData } from "@/hooks/useAsyncData"
import { GENDER_LABELS } from "@/types/user-profile.types"
import type { AdminExamSession } from "@/types/exam-session.types"
import type { AdminEnrollmentItem } from "@/types/course.types"
import type { ProgressDashboard } from "@/types/analytics.types"
import {
	getLockAccountErrorMessage,
	getLockAccountSuccessMessage,
} from "@/utils/srsMessages"
import Toast from "../../components/ui/Toast"
import { studentFromProfile, studentStatus } from "../../types/student.types"
import type { Student } from "../../types/student.types"
import { Badge } from "./components/Badge"
import { DetailAvatar } from "./components/DetailAvatar"
import { ExamSessionTable } from "./components/ExamSessionTable"
import { InlineButton } from "./components/InlineButton"
import { EditProfileModal } from "./components/EditProfileModal"
import { RankChangeModal } from "./components/RankChangeModal"
import { AlertModal } from "./components/AlertModal"
import { LockAccountModal } from "./components/LockAccountModal"
import { DocumentsTab } from "./components/DocumentsTab"
import { EnrollmentsTable } from "./components/EnrollmentsTable"
import "./StudentDetailPage.css"

type ModalType = "edit" | "rank" | "alert" | "lock" | null

export default function StudentDetailPage() {
	const navigate = useNavigate()
	const { studentId } = useParams()
	const [modal, setModal] = useState<ModalType>(null)
	const [toastMessage, setToastMessage] = useState("")
	const [toastType, setToastType] = useState<"success" | "error">("success")
	const [toastVisible, setToastVisible] = useState(false)
	const [submitting, setSubmitting] = useState(false)

	const loadStudent = useCallback(async () => {
		if (!studentId) {
			return { success: true as const, data: null }
		}
		const res = await userService.getById(studentId)
		if (!res.success) return res
		return { success: true as const, data: studentFromProfile(res.data) }
	}, [studentId])
	const studentQuery = useAsyncData<Student | null>(loadStudent, {
		initialData: null,
		enabled: Boolean(studentId),
		retainPreviousData: false,
	})

	const loadExamSessions = useCallback(async () => {
		if (!studentId) {
			return { success: true as const, data: [] as AdminExamSession[] }
		}
		const res = await examService.listSessions({ studentId, size: 20 })
		if (!res.success) return res
		return { success: true as const, data: res.data.items }
	}, [studentId])
	const examSessionsQuery = useAsyncData(loadExamSessions, {
		initialData: [] as AdminExamSession[],
		enabled: Boolean(studentId),
		retainPreviousData: false,
	})

	const loadEnrollments = useCallback(async () => {
		if (!studentId) {
			return { success: true as const, data: [] as AdminEnrollmentItem[] }
		}
		const res = await courseService.listStudentEnrollments({
			studentId,
			size: 100,
		})
		if (!res.success) return res
		return { success: true as const, data: res.data.items }
	}, [studentId])
	const enrollmentsQuery = useAsyncData(loadEnrollments, {
		initialData: [] as AdminEnrollmentItem[],
		enabled: Boolean(studentId),
		retainPreviousData: false,
	})

	const loadAnalytics = useCallback(async () => {
		if (!studentId) {
			return { success: true as const, data: null }
		}
		const res = await analyticsService.getStudentProgress(studentId)
		if (!res.success) return { success: true as const, data: null }
		return { success: true as const, data: res.data }
	}, [studentId])
	const analyticsQuery = useAsyncData<ProgressDashboard | null>(
		loadAnalytics,
		{
			initialData: null,
			enabled: Boolean(studentId),
			retainPreviousData: false,
		},
	)

	const showToast = (message: string, type: "success" | "error") => {
		setToastMessage(message)
		setToastType(type)
		setToastVisible(true)
	}

	const student = studentQuery.data
	const error = studentQuery.error ?? ""
	const examSessions = examSessionsQuery.data
	const enrollments = enrollmentsQuery.data
	const analytics = analyticsQuery.data

	if (studentQuery.loading) {
		return <div className="detail-empty">Đang tải hồ sơ học viên...</div>
	}

	if (error || !student) {
		return (
			<div className="detail-empty">
				<h1>{error || "Không tìm thấy hồ sơ học viên"}</h1>
				<button onClick={() => navigate("/students")}>
					← Quay lại danh sách
				</button>
			</div>
		)
	}

	const status = studentStatus(student)
	const closeModal = () => setModal(null)
	const handleStudentChange = (next: Student) => studentQuery.setData(next)

	const handleUnlock = async () => {
		if (!window.confirm("Mở khóa tài khoản học viên này?")) return
		setSubmitting(true)
		const res = await identityService.setLock(student.id, false)
		setSubmitting(false)
		if (res.success) {
			studentQuery.setData({ ...student, isActive: true })
			studentQuery.refetch()
			showToast(getLockAccountSuccessMessage(false), "success")
		} else {
			showToast(getLockAccountErrorMessage(res), "error")
		}
	}

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
					onClick={() => navigate("/students")}
				>
					←
				</button>
				<div>
					<h1>Hồ Sơ Học Viên</h1>
					<p>Thông tin chi tiết</p>
				</div>
				<div className="student-detail__actions">
					<InlineButton
						tone="green"
						onClick={() => setModal("edit")}
						disabled={submitting}
					>
						Sửa Hồ Sơ
					</InlineButton>
					<InlineButton
						tone="yellow"
						onClick={() => setModal("rank")}
						disabled={submitting}
					>
						Phân Hạng Bằng
					</InlineButton>
					<InlineButton
						tone="green"
						onClick={() => setModal("alert")}
						disabled={submitting}
					>
						Gửi Cảnh Báo
					</InlineButton>
					{student.isActive ? (
						<InlineButton
							tone="red"
							onClick={() => setModal("lock")}
							disabled={submitting}
						>
							Khóa TK
						</InlineButton>
					) : (
						<InlineButton
							tone="green"
							onClick={handleUnlock}
							disabled={submitting}
						>
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
								? new Date(
										student.dateOfBirth,
									).toLocaleDateString("vi-VN")
								: "—"}
						</div>
						<div>
							⚥{" "}
							{student.gender
								? GENDER_LABELS[student.gender]
								: "—"}
						</div>
						<div>🏷 Hạng {student.licenseTier ?? "Chưa phân"}</div>
					</div>
					<div className="student-detail__divider" />
					<div className="student-detail__label">Địa chỉ</div>
					<div>{student.address ?? "—"}</div>
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
						<div
							className="card-surface student-detail__chart-card"
							style={{ marginBottom: 10 }}
						>
							<h2>Tiến Độ Học Tập</h2>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(4, 1fr)",
									gap: 12,
									marginTop: 12,
								}}
							>
								{[
									{
										label: "Hoàn thành khoá học",
										value: `${analytics.completionPct}%`,
									},
									{
										label: "Lượt thi",
										value: analytics.attemptCount,
									},
									{
										label: "Tỉ lệ đỗ",
										value: `${analytics.passRate}%`,
									},
									{
										label: "Điểm trung bình",
										value: analytics.avgExamScore,
									},
								].map((stat) => (
									<div
										key={stat.label}
										style={{
											background:
												"rgba(255,255,255,0.04)",
											borderRadius: 8,
											padding: "10px 12px",
										}}
									>
										<div
											style={{
												fontSize: 11,
												color: "rgba(255,255,255,0.4)",
												marginBottom: 4,
											}}
										>
											{stat.label}
										</div>
										<div
											style={{
												fontSize: 20,
												fontWeight: 700,
												color: "#f0f0f0",
											}}
										>
											{stat.value}
										</div>
									</div>
								))}
							</div>
							{analytics.weakTopics.length > 0 && (
								<div style={{ marginTop: 14 }}>
									<div
										style={{
											fontSize: 12,
											color: "rgba(255,255,255,0.45)",
											marginBottom: 6,
										}}
									>
										Topic yếu
									</div>
									{analytics.weakTopics.map((t) => (
										<div
											key={t.topicId}
											style={{
												display: "flex",
												justifyContent: "space-between",
												fontSize: 13,
												padding: "4px 0",
												borderTop:
													"1px solid rgba(255,255,255,0.06)",
											}}
										>
											<span>{t.topicName}</span>
											<span style={{ color: "#f87171" }}>
												{Math.round(
													t.accuracyRate * 100,
												)}
												% chính xác
											</span>
										</div>
									))}
								</div>
							)}
						</div>
					)}
					<div
						className="card-surface student-detail__chart-card"
						style={{ marginBottom: 10 }}
					>
						<h2>Khóa Học Đã Đăng Ký</h2>
						{enrollmentsQuery.loading ? (
							<p
								style={{
									color: "rgba(255,255,255,0.4)",
									padding: "16px 0",
								}}
							>
								Đang tải...
							</p>
						) : enrollmentsQuery.error ? (
							<p
								style={{
									color: "#f87171",
									padding: "16px 0",
								}}
							>
								Không tải được danh sách khóa học:{" "}
								{enrollmentsQuery.error}
							</p>
						) : (
							<EnrollmentsTable enrollments={enrollments} />
						)}
					</div>
					<div className="card-surface student-detail__chart-card">
						<h2>Lịch Sử Thi</h2>
						{examSessionsQuery.loading ? (
							<p
								style={{
									color: "rgba(255,255,255,0.4)",
									padding: "16px 0",
								}}
							>
								Đang tải...
							</p>
						) : (
							<ExamSessionTable sessions={examSessions} />
						)}
					</div>
					<DocumentsTab userId={student.id} />
				</section>
			</div>

			{modal === "edit" && (
				<EditProfileModal
					student={student}
					onClose={closeModal}
					onToast={showToast}
					onStudentChange={handleStudentChange}
				/>
			)}

			{modal === "rank" && (
				<RankChangeModal
					student={student}
					onClose={closeModal}
					onToast={showToast}
					onStudentChange={handleStudentChange}
					onRefetch={studentQuery.refetch}
				/>
			)}

			{modal === "alert" && (
				<AlertModal
					student={student}
					onClose={closeModal}
					onToast={showToast}
				/>
			)}

			{modal === "lock" && (
				<LockAccountModal
					student={student}
					onClose={closeModal}
					onToast={showToast}
					onStudentChange={handleStudentChange}
					onRefetch={studentQuery.refetch}
				/>
			)}
		</div>
	)
}
