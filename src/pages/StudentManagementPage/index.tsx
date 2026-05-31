import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAsyncData } from "@/hooks/useAsyncData";
import { userService } from "@/services";
import {
	studentFromProfile,
	studentStatus,
	type Student,
	type StudentFilters,
} from "../../types/student.types";
import Pagination from "../../components/Pagination";
import { DEFAULT_PAGE_SIZE } from "../../constants/pagination";
import { FilterBar } from "./components/FilterBar";
import { StudentTable } from "./components/StudentTable";
import { SummaryCard } from "./components/SummaryCard";
import "./StudentManagementPage.css";

const EMPTY_STUDENT_PAGE = {
	items: [] as Student[],
	total: 0,
};

export default function StudentManagementPage() {
	const navigate = useNavigate();
	const [filters, setFilters] = useState<StudentFilters>({
		search: "",
		licenseTier: "",
		status: "",
	});
	const [currentPage, setCurrentPage] = useState(1);

	const loadStudents = useCallback(async () => {
		const isActive =
			filters.status === "locked"
				? false
				: filters.status === ""
					? undefined
					: true;

		const res = await userService.list({
			role: "STUDENT",
			page: currentPage,
			size: DEFAULT_PAGE_SIZE,
			search: filters.search.trim() || undefined,
			isActive,
		});

		if (!res.success) return res;

		let mapped = res.data.items.map(studentFromProfile);
		if (filters.licenseTier) {
			mapped = mapped.filter(
				(s) => s.licenseTier === filters.licenseTier,
			);
		}

		return {
			success: true as const,
			data: {
				items: mapped,
				total: res.data.total,
			},
		};
	}, [currentPage, filters.licenseTier, filters.search, filters.status]);
	const studentsQuery = useAsyncData(loadStudents, {
		initialData: EMPTY_STUDENT_PAGE,
		retainPreviousData: false,
	});

	const students = studentsQuery.data.items;
	const total = studentsQuery.data.total;
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
					<h1>Quáº£n LÃ½ Há»c ViÃªn</h1>
					<p>Theo dÃµi tiáº¿n Ä‘á»™ vÃ  quáº£n lÃ½ thÃ´ng tin há»c viÃªn</p>
				</div>
				<button
					className="student-management__add"
					onClick={() => navigate("/students/new")}>
					+ ThÃªm Há»c ViÃªn
				</button>
			</div>

			<div className="student-summary-grid">
				<SummaryCard
					title="Tá»•ng há»c viÃªn"
					value={summary.total.toLocaleString("vi-VN")}
					accent="#f3f4f6"
				/>
				<SummaryCard
					title="Äang há»c (trang)"
					value={summary.studying.toLocaleString("vi-VN")}
					accent="#4ade80"
				/>
				<SummaryCard
					title="ÄÃ£ khÃ³a (trang)"
					value={summary.locked.toLocaleString("vi-VN")}
					accent="#ef4444"
				/>
				<SummaryCard
					title="HoÃ n thÃ nh"
					value="â€”"
					accent="#94a3b8"
				/>
			</div>

			<FilterBar
				filters={filters}
				onChange={handleFilters}
			/>

			{studentsQuery.loading && <div className="student-empty">Äang táº£i...</div>}
			{studentsQuery.error && !studentsQuery.loading && (
				<div className="student-empty">Lá»—i: {studentsQuery.error}</div>
			)}
			{!studentsQuery.loading && !studentsQuery.error && (
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
