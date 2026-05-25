import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "@/services";
import type { LicenseTier } from "@/types/user-profile.types";
import {
	STUDENT_LICENSE_TIERS,
	STUDENT_STATUS_LABELS,
	STUDENT_STATUS_OPTIONS,
	studentAvatarColor,
	studentFromProfile,
	studentInitials,
	studentStatus,
} from "../../types/student.types";
import type {
	Student,
	StudentFilters,
	StudentStatus,
} from "../../types/student.types";
import Pagination from "../../components/Pagination";
import { DEFAULT_PAGE_SIZE } from "../../constants/pagination";
import "./StudentManagementPage.css";

const STATUS_THEME: Record<StudentStatus, string> = {
	studying: "student-pill--studying",
	warning: "student-pill--warning",
	completed: "student-pill--completed",
	locked: "student-pill--locked",
};

function SummaryCard({
	title,
	value,
	accent,
}: {
	title: string;
	value: string;
	accent: string;
}) {
	return (
		<div className="student-summary-card">
			<div className="student-summary-card__title">{title}</div>
			<div
				className="student-summary-card__value"
				style={{ color: accent }}>
				{value}
			</div>
		</div>
	);
}

function FilterBar({
	filters,
	onChange,
}: {
	filters: StudentFilters;
	onChange: (next: StudentFilters) => void;
}) {
	const update = (patch: Partial<StudentFilters>) =>
		onChange({ ...filters, ...patch });

	return (
		<div className="student-filters">
			<div className="student-filters__search">
				<span>⌕</span>
				<input
					value={filters.search}
					onChange={(e) => update({ search: e.target.value })}
					placeholder="Tìm kiếm theo tên, email, SĐT..."
				/>
			</div>

			<select
				value={filters.licenseTier}
				onChange={(e) =>
					update({
						licenseTier: e.target.value as LicenseTier | "",
					})
				}>
				<option value="">Hạng bằng</option>
				{STUDENT_LICENSE_TIERS.map((tier) => (
					<option
						key={tier}
						value={tier}>
						{tier}
					</option>
				))}
			</select>

			<select
				value={filters.status}
				onChange={(e) =>
					update({
						status: e.target.value as StudentFilters["status"],
					})
				}>
				<option value="">Trạng thái</option>
				{STUDENT_STATUS_OPTIONS.map((item) => (
					<option
						key={item.value}
						value={item.value}>
						{item.label}
					</option>
				))}
			</select>

			<button
				className="student-filters__clear"
				onClick={() =>
					onChange({ search: "", licenseTier: "", status: "" })
				}>
				⊘ Lọc
			</button>
		</div>
	);
}

function StudentTable({
	students,
	onOpen,
}: {
	students: Student[];
	onOpen: (id: string) => void;
}) {
	if (!students.length) {
		return (
			<div className="student-empty">Không tìm thấy học viên nào.</div>
		);
	}

	return (
		<div className="student-table-wrap">
			<table className="student-table">
				<thead>
					<tr>
						<th>Học Viên</th>
						<th>Liên Hệ</th>
						<th>Hạng Bằng</th>
						<th>Ngày Nhập Học</th>
						<th>Trạng Thái</th>
						<th>Thao Tác</th>
					</tr>
				</thead>
				<tbody>
					{students.map((student) => {
						const status = studentStatus(student);
						return (
							<tr
								key={student.id}
								onClick={() => onOpen(student.id)}>
								<td>
									<div className="student-table__name">
										<div
											className="student-avatar"
											style={{
												background: studentAvatarColor(
													student.id,
												),
											}}>
											{studentInitials(student.fullName)}
										</div>
										<div>
											<div className="student-table__fullname">
												{student.fullName}
											</div>
											<div className="student-table__meta">
												{student.id.slice(0, 8)}
											</div>
										</div>
									</div>
								</td>
								<td>
									<div className="student-table__contact">
										<span>{student.email}</span>
										<span>{student.phoneNumber ?? "—"}</span>
									</div>
								</td>
								<td>
									<span className="student-rank">
										{student.licenseTier ?? "Chưa phân"}
									</span>
								</td>
								<td>
									{student.enrolledAt
										? new Date(
												student.enrolledAt,
											).toLocaleDateString("vi-VN")
										: "—"}
								</td>
								<td>
									<span
										className={`student-pill ${STATUS_THEME[status]}`}>
										{STUDENT_STATUS_LABELS[status]}
									</span>
								</td>
								<td>
									<button
										className="student-table__action"
										onClick={(e) => {
											e.stopPropagation();
											onOpen(student.id);
										}}>
										Chi tiết
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}


export default function StudentManagementPage() {
	const navigate = useNavigate();
	const [filters, setFilters] = useState<StudentFilters>({
		search: "",
		licenseTier: "",
		status: "",
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [students, setStudents] = useState<Student[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError("");

		const isActive =
			filters.status === "locked"
				? false
				: filters.status === ""
					? undefined
					: true;

		userService
			.list({
				role: "STUDENT",
				page: currentPage,
				size: DEFAULT_PAGE_SIZE,
				search: filters.search.trim() || undefined,
				isActive,
			})
			.then((res) => {
				if (cancelled) return;
				if (res.success) {
					let mapped = res.data.items.map(studentFromProfile);
					if (filters.licenseTier) {
						mapped = mapped.filter(
							(s) => s.licenseTier === filters.licenseTier,
						);
					}
					setStudents(mapped);
					setTotal(res.data.total);
				} else {
					setError(res.error);
					setStudents([]);
					setTotal(0);
				}
				setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [filters.search, filters.status, filters.licenseTier, currentPage]);

	const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

	const summary = useMemo(() => {
		const studying = students.filter(
			(s) => studentStatus(s) === "studying",
		).length;
		const locked = students.filter(
			(s) => studentStatus(s) === "locked",
		).length;
		return { total, studying, locked };
	}, [students, total]);

	const handleFilters = (next: StudentFilters) => {
		setFilters(next);
		setCurrentPage(1);
	};

	return (
		<div className="student-management">
			<div className="student-management__header">
				<div>
					<h1>Quản Lý Học Viên</h1>
					<p>Theo dõi tiến độ và quản lý thông tin học viên</p>
				</div>
				<button
					className="student-management__add"
					onClick={() => navigate("/students/new")}>
					+ Thêm Học Viên
				</button>
			</div>

			<div className="student-summary-grid">
				<SummaryCard
					title="Tổng học viên"
					value={summary.total.toLocaleString("vi-VN")}
					accent="#f3f4f6"
				/>
				<SummaryCard
					title="Đang học (trang)"
					value={summary.studying.toLocaleString("vi-VN")}
					accent="#4ade80"
				/>
				<SummaryCard
					title="Đã khóa (trang)"
					value={summary.locked.toLocaleString("vi-VN")}
					accent="#ef4444"
				/>
				<SummaryCard
					title="Hoàn thành"
					value="—"
					accent="#94a3b8"
				/>
			</div>

			<FilterBar
				filters={filters}
				onChange={handleFilters}
			/>

			{loading && <div className="student-empty">Đang tải...</div>}
			{error && !loading && (
				<div className="student-empty">Lỗi: {error}</div>
			)}
			{!loading && !error && (
				<StudentTable
					students={students}
					onOpen={(id) => navigate(`/students/${id}`)}
				/>
			)}

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onChange={setCurrentPage}
			/>
		</div>
	);
}
