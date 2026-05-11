import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
} from "recharts";
import Toast from "../../components/ui/Toast";
import { MOCK_STUDENTS } from "../../data/studentData";
import type {
	Student,
	StudentAlertChannel,
	StudentStatus,
} from "../../types/student.types";
import {
	STUDENT_ALERT_CHANNEL_LABELS,
	STUDENT_ALERT_TEMPLATES,
	STUDENT_RANK_OPTIONS,
	STUDENT_STATUS_LABELS,
	STUDENT_STATUS_TONES,
} from "../../types/student.types";
import "./StudentDetailPage.css";

type ModalType = "rank" | "alert" | "lock" | null;

function Badge({ status }: { status: StudentStatus }) {
	return (
		<span
			className={`detail-badge detail-badge--${STUDENT_STATUS_TONES[status]}`}>
			{STUDENT_STATUS_LABELS[status]}
		</span>
	);
}

function InlineButton({
	children,
	tone,
	onClick,
}: {
	children: string;
	tone: "yellow" | "green" | "red";
	onClick: () => void;
}) {
	return (
		<button
			className={`detail-action detail-action--${tone}`}
			onClick={onClick}>
			{children}
		</button>
	);
}

function Modal({
	title,
	children,
	onClose,
	footer,
}: {
	title: string;
	children: React.ReactNode;
	onClose: () => void;
	footer?: React.ReactNode;
}) {
	return (
		<div
			className="detail-modal__backdrop"
			onClick={onClose}>
			<div
				className="detail-modal"
				onClick={(e) => e.stopPropagation()}>
				<div className="detail-modal__title">{title}</div>
				{children}
				{footer}
			</div>
		</div>
	);
}

export default function StudentDetailPage() {
	const navigate = useNavigate();
	const { studentId } = useParams();
	const initialStudent = useMemo(
		() => MOCK_STUDENTS.find((student) => student.id === studentId) ?? null,
		[studentId],
	);
	const [studentChanges, setStudentChanges] = useState<
		Record<string, Partial<Student>>
	>({});
	const [modal, setModal] = useState<ModalType>(null);
	const [rank, setRank] = useState<Student["licenseClass"]>("B1");
	const [alertTemplate, setAlertTemplate] = useState(
		STUDENT_ALERT_TEMPLATES[0],
	);
	const [alertContent, setAlertContent] = useState("");
	const [alertChannels, setAlertChannels] = useState<StudentAlertChannel[]>([
		"email",
	]);
	const [lockReason, setLockReason] = useState("");
	const [toastMessage, setToastMessage] = useState("");
	const [toastVisible, setToastVisible] = useState(false);

	const student = useMemo(() => {
		if (!initialStudent) return null;
		return {
			...initialStudent,
			...(studentChanges[initialStudent.id] ?? {}),
		};
	}, [initialStudent, studentChanges]);

	if (!student) {
		return (
			<div className="detail-empty">
				<h1>Không tìm thấy hồ sơ học viên</h1>
				<button onClick={() => navigate("/students")}>
					← Quay lại danh sách
				</button>
			</div>
		);
	}

	const updateStudent = (patch: Partial<Student>) => {
		setStudentChanges((current) => ({
			...current,
			[student.id]: {
				...(current[student.id] ?? {}),
				...patch,
			},
		}));
	};

	const openRankModal = () => {
		setRank(student.licenseClass);
		setModal("rank");
	};

	const openAlertModal = () => {
		setAlertTemplate(STUDENT_ALERT_TEMPLATES[0]);
		setAlertContent("");
		setAlertChannels(["email"]);
		setModal("alert");
	};

	const openLockModal = () => {
		setLockReason("");
		setModal("lock");
	};

	const confirmRank = () => {
		updateStudent({ licenseClass: rank, status: "studying" });
		setToastMessage(`Đã cập nhật hạng bằng sang ${rank}.`);
		setToastVisible(true);
		setModal(null);
	};

	const confirmAlert = () => {
		if (!alertContent.trim()) {
			setToastMessage("Vui lòng nhập nội dung cảnh báo.");
			setToastVisible(true);
			return;
		}
		if (!alertChannels.length) {
			setToastMessage("Chọn ít nhất một kênh gửi cảnh báo.");
			setToastVisible(true);
			return;
		}
		updateStudent({
			warningCount: student.warningCount + 1,
			status: "warning",
		});
		setToastMessage("Đã ghi nhận cảnh báo học tập.");
		setToastVisible(true);
		setModal(null);
	};

	const confirmLock = () => {
		if (!lockReason.trim()) {
			setToastMessage("Vui lòng nhập lý do khóa tài khoản.");
			setToastVisible(true);
			return;
		}
		updateStudent({ status: "locked" });
		setToastMessage("Đã khóa tài khoản học viên.");
		setToastVisible(true);
		setModal(null);
	};

	return (
		<div className="student-detail">
			<Toast
				message={toastMessage}
				type={toastMessage.includes("Đã") ? "success" : "error"}
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
					<p>Thông tin chi tiết và lịch sử thi</p>
				</div>
				<div className="student-detail__actions">
					<InlineButton
						tone="yellow"
						onClick={openRankModal}>
						Phân Hạng Bằng
					</InlineButton>
					<InlineButton
						tone="green"
						onClick={openAlertModal}>
						Gửi Cảnh Báo
					</InlineButton>
					<InlineButton
						tone="red"
						onClick={openLockModal}>
						Khóa TK
					</InlineButton>
				</div>
			</div>

			<div className="student-detail__grid">
				<aside className="student-detail__profile card-surface">
					<div
						className="student-detail__avatar"
						style={{ background: student.avatarColor }}>
						{student.initials}
					</div>
					<div className="student-detail__name">
						{student.fullName}
					</div>
					<Badge status={student.status} />
					<div className="student-detail__info">
						<div>✉ {student.email}</div>
						<div>☎ {student.phone}</div>
						<div>📅 Sinh: {student.dateOfBirth}</div>
						<div>🏷 Hạng {student.licenseClass}</div>
					</div>
					<div className="student-detail__divider" />
					<div className="student-detail__label">Địa chỉ</div>
					<div>{student.address}</div>
					<div className="student-detail__divider" />
					<div className="student-detail__label">
						Giảng viên phụ trách
					</div>
					<div>{student.instructor}</div>
				</aside>

				<section className="student-detail__content">
					<div className="student-detail__stats">
						<div className="card-surface student-detail__stat">
							<span className="student-detail__stat-title">
								Tiến độ
							</span>
							<strong>{student.progress}%</strong>
						</div>
						<div className="card-surface student-detail__stat student-detail__stat--blue">
							<span className="student-detail__stat-title">
								Số lần thi
							</span>
							<strong>{student.examCount}</strong>
						</div>
						<div className="card-surface student-detail__stat student-detail__stat--green">
							<span className="student-detail__stat-title">
								Số lần đạt
							</span>
							<strong>{student.passedCount}</strong>
						</div>
					</div>

					<div className="card-surface student-detail__chart-card">
						<h2>Biểu Đồ Tiến Bộ</h2>
						<div className="student-detail__chart">
							<ResponsiveContainer
								width="100%"
								height="100%">
								<LineChart data={student.progressTrend}>
									<CartesianGrid
										strokeDasharray="3 3"
										stroke="rgba(255,255,255,0.08)"
									/>
									<XAxis
										dataKey="date"
										stroke="rgba(255,255,255,0.45)"
										tickLine={false}
										axisLine={false}
									/>
									<YAxis
										domain={[0, 100]}
										stroke="rgba(255,255,255,0.45)"
										tickLine={false}
										axisLine={false}
									/>
									<Tooltip
										contentStyle={{
											background: "#2b2b2b",
											border: "none",
											color: "#fff",
										}}
									/>
									<Line
										type="monotone"
										dataKey="value"
										stroke="#f9c74f"
										strokeWidth={3}
										dot={{ r: 4, fill: "#f9c74f" }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</div>
				</section>
			</div>

			<div className="card-surface student-detail__history">
				<h2>Lịch Sử Thi</h2>
				<table>
					<thead>
						<tr>
							<th>Ngày Thi</th>
							<th>Loại Bài Thi</th>
							<th>Điểm</th>
							<th>Thời Gian</th>
							<th>Kết Quả</th>
						</tr>
					</thead>
					<tbody>
						{student.examHistory.map((item) => (
							<tr key={item.id}>
								<td>{item.date}</td>
								<td>{item.examType}</td>
								<td
									className={
										item.score >= 80
											? "student-score--good"
											: item.score >= 60
												? "student-score--warn"
												: "student-score--bad"
									}>
									{item.score}
								</td>
								<td>{item.duration}</td>
								<td>
									<span
										className={`student-result student-result--${item.result}`}>
										{item.result === "pass"
											? "Đạt"
											: "Không đạt"}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{modal === "rank" && (
				<Modal
					title="Phân hạng bằng lái"
					onClose={() => setModal(null)}
					footer={
						<div className="detail-modal__footer">
							<button onClick={() => setModal(null)}>Hủy</button>
							<button
								className="detail-modal__confirm detail-modal__confirm--yellow"
								onClick={confirmRank}>
								Xác nhận phân hạng
							</button>
						</div>
					}>
					<p className="detail-modal__hint">
						Hạng hiện tại: <strong>{student.licenseClass}</strong>
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
								onClick={confirmAlert}>
								Gửi cảnh báo
							</button>
						</div>
					}>
					<div className="detail-modal__field">
						<label>Mẫu cảnh báo</label>
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
						<label>Nội dung cảnh báo</label>
						<textarea
							value={alertContent}
							onChange={(e) => setAlertContent(e.target.value)}
							placeholder="Nhập nội dung cảnh báo cho học viên..."
						/>
					</div>
					<div className="detail-modal__field">
						<label>Kênh gửi</label>
						<div className="detail-modal__channels">
							{(
								Object.keys(
									STUDENT_ALERT_CHANNEL_LABELS,
								) as StudentAlertChannel[]
							).map((channel) => (
								<label key={channel}>
									<input
										type="checkbox"
										checked={alertChannels.includes(
											channel,
										)}
										onChange={() =>
											setAlertChannels((current) =>
												current.includes(channel)
													? current.filter(
															(item) =>
																item !==
																channel,
														)
													: [...current, channel],
											)
										}
									/>
									{STUDENT_ALERT_CHANNEL_LABELS[channel]}
								</label>
							))}
						</div>
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
								onClick={confirmLock}>
								Xác nhận khóa
							</button>
						</div>
					}>
					<p className="detail-modal__hint">
						<strong>{student.fullName}</strong> sẽ không thể đăng
						nhập sau khi bị khóa.
					</p>
					<div className="detail-modal__field">
						<label>Lý do khóa *</label>
						<textarea
							value={lockReason}
							onChange={(e) => setLockReason(e.target.value)}
							placeholder="Nhập lý do khóa tài khoản..."
						/>
					</div>
				</Modal>
			)}
		</div>
	);
}
