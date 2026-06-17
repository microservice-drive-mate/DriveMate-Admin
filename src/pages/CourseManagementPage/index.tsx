import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAsyncData } from "@/hooks/useAsyncData"
import { courseService } from "@/services"
import { useAuthStore } from "@/store/authStore"
import type { UserRole } from "@/types"
import { getCourseListErrorMessage, SRS_MESSAGES } from "@/utils/srsMessages"
import type { CourseFilters, CourseResponse } from "../../types/course.types"
import Pagination from "../../components/Pagination"
import { DEFAULT_PAGE_SIZE } from "../../constants/pagination"
import { CourseTable } from "./components/CourseTable"
import { FilterBar } from "./components/FilterBar"
import { SummaryCard } from "./components/SummaryCard"
import "./CourseManagementPage.css"

const EMPTY_COURSE_PAGE = {
	items: [] as CourseResponse[],
	total: 0,
	page: 1,
	size: DEFAULT_PAGE_SIZE,
}

function canUseAdminCourses(role: UserRole | undefined) {
	return (
		role === "ADMIN" || role === "CENTER_MANAGER" || role === "INSTRUCTOR"
	)
}

export default function CourseManagementPage() {
	const navigate = useNavigate()
	const currentUser = useAuthStore((state) => state.user)
	const canManageCourses = canUseAdminCourses(currentUser?.role)
	const scopedLicenseCategory = (
		canManageCourses ? "" : (currentUser?.licenseTier ?? "")
	) as CourseFilters["licenseCategory"]
	const [filters, setFilters] = useState<CourseFilters>({
		search: "",
		licenseCategory: "",
		status: "",
	})
	const [currentPage, setCurrentPage] = useState(1)

	const courseParams = useMemo(
		() => ({
			page: currentPage,
			size: DEFAULT_PAGE_SIZE,
			...(scopedLicenseCategory || filters.licenseCategory
				? {
						licenseCategory:
							scopedLicenseCategory || filters.licenseCategory,
					}
				: {}),
			...(filters.status ? { status: filters.status } : {}),
		}),
		[
			currentPage,
			filters.licenseCategory,
			filters.status,
			scopedLicenseCategory,
		],
	)

	const loadCourses = useCallback(async () => {
		const res = canManageCourses
			? await courseService.list(courseParams)
			: await courseService.listPublic(courseParams)
		if (!res.success) {
			return { ...res, error: getCourseListErrorMessage(res) }
		}
		return res
	}, [canManageCourses, courseParams])
	const coursesQuery = useAsyncData(loadCourses, {
		initialData: EMPTY_COURSE_PAGE,
		retainPreviousData: false,
	})

	const loadActiveTotal = useCallback(async () => {
		const params = {
			size: 1,
			status: "ACTIVE",
			...(scopedLicenseCategory
				? { licenseCategory: scopedLicenseCategory }
				: {}),
		}
		const res = canManageCourses
			? await courseService.list(params)
			: await courseService.listPublic(params)
		if (!res.success) return res
		return { success: true as const, data: res.data.total }
	}, [canManageCourses, scopedLicenseCategory])
	const activeTotalQuery = useAsyncData(loadActiveTotal, { initialData: 0 })

	const handleFilters = (next: CourseFilters) => {
		setFilters(next)
		setCurrentPage(1)
	}

	const courses = coursesQuery.data.items
	const total = coursesQuery.data.total
	const filtered = useMemo(() => {
		const q = filters.search.trim().toLowerCase()
		if (!q) return courses
		return courses.filter((c) => c.title.toLowerCase().includes(q))
	}, [courses, filters.search])

	const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE))

	return (
		<div className="course-management">
			<div className="course-management__header">
				<div>
					<h1>Quản Lý Khóa Học</h1>
					<p>Quản lý các khóa học lý thuyết lái xe</p>
				</div>
				{canManageCourses && (
					<button
						className="course-management__add"
						onClick={() => navigate("/courses/new")}
					>
						+ Thêm Khóa Học
					</button>
				)}
			</div>

			<div className="course-summary-grid">
				<SummaryCard title="Tổng khóa học" value={total} />
				<SummaryCard
					title="Đang hoạt động"
					value={activeTotalQuery.data}
					accent="#4ade80"
				/>
			</div>

			{coursesQuery.error && (
				<div className="course-error">{coursesQuery.error}</div>
			)}

			<FilterBar
				filters={filters}
				lockedLicenseCategory={scopedLicenseCategory}
				onChange={handleFilters}
			/>

			{coursesQuery.loading ? (
				<div className="course-empty">Đang tải...</div>
			) : (
				<CourseTable
					courses={filtered}
					canEdit={canManageCourses}
					emptyMessage={SRS_MESSAGES.MSG24}
					onView={(id) => navigate(`/courses/${id}`)}
					onEdit={(id) => navigate(`/courses/${id}/edit`)}
				/>
			)}

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				totalItems={total}
				pageSize={DEFAULT_PAGE_SIZE}
				label="khóa học"
				onChange={setCurrentPage}
			/>
		</div>
	)
}
