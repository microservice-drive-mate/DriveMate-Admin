import { useCallback, useState } from "react"
import { analyticsService, examService } from "@/services"
import { useAsyncData } from "@/hooks/useAsyncData"
import type { ProgressDashboard } from "@/types/analytics.types"
import type { AdminExamSession } from "@/types/exam-session.types"
import type { ClassProgress, ClassProgressStudent } from "@/types"
import Toast from "../../components/ui/Toast"
import { AlertModal } from "../StudentDetailPage/components/AlertModal"
import { ExamSessionTable } from "../StudentDetailPage/components/ExamSessionTable"
import "../StudentDetailPage/StudentDetailPage.css"

interface ClassStudentsModalProps {
	classItem: ClassProgress
	onClose: () => void
}

function formatDate(value: string | null): string {
	return value ? new Date(value).toLocaleDateString("vi-VN") : "—"
}

export function ClassStudentsModal({
	classItem,
	onClose,
}: ClassStudentsModalProps) {
	const [selected, setSelected] = useState<ClassProgressStudent | null>(null)

	return (
		<div className="gv-students-modal__backdrop" onClick={onClose}>
			<div
				className="gv-students-modal"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="gv-students-modal__head">
					{selected ? (
						<button
							className="gv-students-modal__back"
							onClick={() => setSelected(null)}
						>
							← Danh sách
						</button>
					) : (
						<span className="gv-students-modal__title">
							{classItem.name}
						</span>
					)}
					<button
						className="gv-students-modal__close"
						onClick={onClose}
						aria-label="Đóng"
					>
						×
					</button>
				</div>

				{selected ? (
					<StudentDetailPanel student={selected} />
				) : (
					<div className="gv-students-modal__list">
						{classItem.students.map((s) => (
							<button
								key={s.id}
								className="gv-students-modal__row"
								onClick={() => setSelected(s)}
							>
								<span className="gv-students-modal__row-main">
									<span className="gv-students-modal__row-name">
										{s.name}
									</span>
									<span className="gv-students-modal__row-email">
										{s.email}
									</span>
								</span>
								<span className="gv-students-modal__row-meta">
									{s.status} · {s.progress}%
								</span>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

interface StudentDetailPanelProps {
	student: ClassProgressStudent
}

function StudentDetailPanel({ student }: StudentDetailPanelProps) {
	const [alertOpen, setAlertOpen] = useState(false)
	const [toastMessage, setToastMessage] = useState("")
	const [toastType, setToastType] = useState<"success" | "error">("success")
	const [toastVisible, setToastVisible] = useState(false)

	const showToast = (message: string, type: "success" | "error") => {
		setToastMessage(message)
		setToastType(type)
		setToastVisible(true)
	}

	const loadAnalytics = useCallback(async () => {
		const res = await analyticsService.getStudentProgress(student.id)
		if (!res.success) return { success: true as const, data: null }
		return { success: true as const, data: res.data }
	}, [student.id])
	const analyticsQuery = useAsyncData<ProgressDashboard | null>(
		loadAnalytics,
		{ initialData: null, retainPreviousData: false },
	)

	const loadExamSessions = useCallback(async () => {
		const res = await examService.listSessions({
			studentId: student.id,
			size: 20,
		})
		if (!res.success) return res
		return { success: true as const, data: res.data.items }
	}, [student.id])
	const examSessionsQuery = useAsyncData(loadExamSessions, {
		initialData: [] as AdminExamSession[],
		retainPreviousData: false,
	})

	const analytics = analyticsQuery.data

	return (
		<div className="gv-students-modal__detail">
			<Toast
				message={toastMessage}
				type={toastType}
				visible={toastVisible}
				onClose={() => setToastVisible(false)}
			/>

			<div className="gv-students-modal__detail-head">
				<div>
					<div className="gv-students-modal__detail-name">
						{student.name}
					</div>
					<div className="gv-students-modal__detail-email">
						✉ {student.email}
					</div>
				</div>
				<button
					className="detail-modal__confirm detail-modal__confirm--green gv-students-modal__warn-btn"
					onClick={() => setAlertOpen(true)}
				>
					Gửi cảnh báo
				</button>
			</div>

			<div className="gv-students-modal__info-grid">
				<div>
					<span className="gv-students-modal__info-label">
						Hạng bằng
					</span>
					<span>{student.licenseTier ?? "Chưa phân"}</span>
				</div>
				<div>
					<span className="gv-students-modal__info-label">
						Trạng thái
					</span>
					<span>{student.status}</span>
				</div>
				<div>
					<span className="gv-students-modal__info-label">
						Tiến độ
					</span>
					<span>{student.progress}%</span>
				</div>
				<div>
					<span className="gv-students-modal__info-label">
						Ngày ghi danh
					</span>
					<span>{formatDate(student.enrolledAt)}</span>
				</div>
				<div>
					<span className="gv-students-modal__info-label">
						Ngày hoàn thành
					</span>
					<span>{formatDate(student.completedAt)}</span>
				</div>
			</div>

			<div className="card-surface student-detail__chart-card">
				<h2>Tiến Độ Học Tập</h2>
				{analyticsQuery.loading ? (
					<p style={{ color: "rgba(255,255,255,0.4)", padding: "16px 0" }}>
						Đang tải...
					</p>
				) : analytics ? (
					<>
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
										background: "rgba(255,255,255,0.04)",
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
											{Math.round(t.accuracyRate * 100)}%
											chính xác
										</span>
									</div>
								))}
							</div>
						)}
					</>
				) : (
					<p style={{ color: "rgba(255,255,255,0.4)", padding: "16px 0" }}>
						Chưa có dữ liệu tiến độ.
					</p>
				)}
			</div>

			<div className="card-surface student-detail__chart-card">
				<h2>Lịch Sử Thi</h2>
				{examSessionsQuery.loading ? (
					<p style={{ color: "rgba(255,255,255,0.4)", padding: "16px 0" }}>
						Đang tải...
					</p>
				) : (
					<ExamSessionTable sessions={examSessionsQuery.data} />
				)}
			</div>

			{alertOpen && (
				<AlertModal
					student={{ id: student.id }}
					onClose={() => setAlertOpen(false)}
					onToast={showToast}
				/>
			)}
		</div>
	)
}
