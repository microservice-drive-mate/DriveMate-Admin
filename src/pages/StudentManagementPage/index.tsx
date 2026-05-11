import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { MOCK_STUDENTS } from "../../data/studentData";
import type {
	Student,
	StudentFilters,
	StudentStatus,
} from "../../types/student.types";
import {
	STUDENT_LICENSE_CLASSES,
	STUDENT_STATUS_LABELS,
	STUDENT_STATUS_OPTIONS,
} from "../../types/student.types";
import "./StudentManagementPage.css";

const PAGE_SIZE = 5;

const STATUS_THEME: Record<StudentStatus, string> = {
	studying: "student-pill--studying",
	warning: "student-pill--warning",
	completed: "student-pill--completed",
	locked: "student-pill--locked",
};

function initials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase();
}

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
				value={filters.licenseClass}
				onChange={(e) =>
					update({
						licenseClass: e.target
							.value as StudentFilters["licenseClass"],
					})
				}>
				<option value="">Hạng bằng</option>
				{STUDENT_LICENSE_CLASSES.map((cls) => (
					<option
						key={cls}
						value={cls}>
						{cls}
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
					onChange({ search: "", licenseClass: "", status: "" })
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
						<th>Tiến Độ</th>
						<th>Số Lần Thi</th>
						<th>Kết Quả Gần Nhất</th>
						<th>Trạng Thái</th>
						<th>Thao Tác</th>
					</tr>
				</thead>
				<tbody>
					{students.map((student) => (
						<tr
							key={student.id}
							onClick={() => onOpen(student.id)}>
							<td>
								<div className="student-table__name">
									<div
										className="student-avatar"
										style={{
											background: student.avatarColor,
										}}>
										{initials(student.fullName)}
									</div>
									<div>
										<div className="student-table__fullname">
											{student.fullName}
										</div>
										<div className="student-table__meta">
											{student.code}
										</div>
									</div>
								</div>
							</td>
							<td>
								<div className="student-table__contact">
									<span>{student.email}</span>
									<span>{student.phone}</span>
								</div>
							</td>
							<td>
								<span className="student-rank">
									{student.licenseClass}
								</span>
							</td>
							<td>
								<div className="student-progress-cell">
									<span>{student.progress}%</span>
									<ProgressBar percent={student.progress} />
								</div>
							</td>
							<td>{student.examCount}</td>
							<td>
								<span
									className={`student-result student-result--${student.lastResult}`}>
									{student.lastResult === "pass"
										? "Đạt"
										: "Không đạt"}
								</span>
							</td>
							<td>
								<span
									className={`student-pill ${STATUS_THEME[student.status]}`}>
									{STUDENT_STATUS_LABELS[student.status]}
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
					))}
				</tbody>
			</table>
		</div>
	);
}

function Pagination({
	currentPage,
	totalPages,
	onChange,
}: {
	currentPage: number;
	totalPages: number;
	onChange: (page: number) => void;
}) {
	if (totalPages <= 1) return null;

	return (
		<div className="student-pagination">
			<button
				disabled={currentPage === 1}
				onClick={() => onChange(currentPage - 1)}>
				‹ Trước
			</button>
			<div className="student-pagination__pages">
				{Array.from(
					{ length: totalPages },
					(_, index) => index + 1,
				).map((page) => (
					<button
						key={page}
						className={
							page === currentPage
								? "student-pagination__page student-pagination__page--active"
								: "student-pagination__page"
						}
						onClick={() => onChange(page)}>
						{page}
					</button>
				))}
			</div>
			<button
				disabled={currentPage === totalPages}
				onClick={() => onChange(currentPage + 1)}>
				Tiếp ›
			</button>
		</div>
	);
}

export default function StudentManagementPage() {
	const navigate = useNavigate();
	const [filters, setFilters] = useState<StudentFilters>({
		search: "",
		licenseClass: "",
		status: "",
	});
	const [currentPage, setCurrentPage] = useState(1);

	const filtered = useMemo(() => {
		const q = filters.search.trim().toLowerCase();
		return MOCK_STUDENTS.filter((student) => {
			const matchSearch =
				!q ||
				student.fullName.toLowerCase().includes(q) ||
				student.email.toLowerCase().includes(q) ||
				student.phone.includes(q);
			const matchClass =
				!filters.licenseClass ||
				student.licenseClass === filters.licenseClass;
			const matchStatus =
				!filters.status || student.status === filters.status;
			return matchSearch && matchClass && matchStatus;
		});
	}, [filters]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const pageSafe = Math.min(currentPage, totalPages);
	const paginated = filtered.slice(
		(pageSafe - 1) * PAGE_SIZE,
		pageSafe * PAGE_SIZE,
	);

	const totals = useMemo(
		() => ({
			total: MOCK_STUDENTS.length,
			studying: MOCK_STUDENTS.filter(
				(student) => student.status === "studying",
			).length,
			warning: MOCK_STUDENTS.filter(
				(student) => student.status === "warning",
			).length,
			completed: MOCK_STUDENTS.filter(
				(student) => student.status === "completed",
			).length,
		}),
		[],
	);

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
					value={totals.total.toLocaleString("vi-VN")}
					accent="#f3f4f6"
				/>
				<SummaryCard
					title="Đang học"
					value={totals.studying.toLocaleString("vi-VN")}
					accent="#f3f4f6"
				/>
				<SummaryCard
					title="Cần cảnh báo"
					value={totals.warning.toLocaleString("vi-VN")}
					accent="#fbbf24"
				/>
				<SummaryCard
					title="Hoàn thành"
					value={totals.completed.toLocaleString("vi-VN")}
					accent="#4ade80"
				/>
			</div>

			<FilterBar
				filters={filters}
				onChange={handleFilters}
			/>

			<StudentTable
				students={paginated}
				onOpen={(id) => navigate(`/students/${id}`)}
			/>

			<Pagination
				currentPage={pageSafe}
				totalPages={totalPages}
				onChange={setCurrentPage}
			/>
		</div>
	);
}
