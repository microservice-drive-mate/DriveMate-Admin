import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { courseService } from "@/services"
import { useAuthStore } from "@/store/authStore"
import type { UserRole } from "@/types"
import {
	getCourseDetailErrorMessage,
	getDeleteCourseErrorMessage,
	getDeleteCourseSuccessMessage,
	getUpdateCourseErrorMessage,
	getUpdateCourseSuccessMessage,
	SRS_MESSAGES,
} from "@/utils/srsMessages"
import type { CourseResponse } from "@/types/course.types"

function canUseAdminCourses(role: UserRole | undefined) {
	return (
		role === "ADMIN" || role === "CENTER_MANAGER" || role === "INSTRUCTOR"
	)
}

/** Nạp chi tiết khóa học + các thao tác kích hoạt/lưu trữ/xóa bài học. */
export function useCourseDetail() {
	const { courseId } = useParams<{ courseId: string }>()
	const navigate = useNavigate()
	const location = useLocation()
	const currentUser = useAuthStore((state) => state.user)
	const canManageCourses = canUseAdminCourses(currentUser?.role)
	const canArchiveCourses =
		currentUser?.role === "ADMIN" || currentUser?.role === "CENTER_MANAGER"
	const scopedLicenseCategory = canManageCourses
		? null
		: (currentUser?.licenseTier ?? null)
	const routeNotice =
		(location.state as { notice?: string } | null)?.notice ?? ""

	const [course, setCourse] = useState<CourseResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [notice, setNotice] = useState(routeNotice)
	const [actionError, setActionError] = useState("")
	const [activating, setActivating] = useState(false)
	const [archiving, setArchiving] = useState(false)
	const [deletingLesson, setDeletingLesson] = useState<string | null>(null)

	useEffect(() => {
		if (!routeNotice) return
		navigate(location.pathname, { replace: true, state: null })
	}, [location.pathname, navigate, routeNotice])

	useEffect(() => {
		if (!courseId) return
		let active = true

		const loadCourse = async () => {
			if (!active) return
			setLoading(true)
			setError("")
			const res = canManageCourses
				? await courseService.getById(courseId)
				: await courseService.getPublicById(courseId)

			if (!active) return
			if (res.success) {
				if (
					scopedLicenseCategory &&
					res.data.licenseCategory !== scopedLicenseCategory
				) {
					setCourse(null)
					setError(SRS_MESSAGES.MSG23)
				} else {
					setCourse(res.data)
				}
			} else {
				setCourse(null)
				setError(getCourseDetailErrorMessage(res))
			}
			setLoading(false)
		}

		void Promise.resolve().then(loadCourse)
		return () => {
			active = false
		}
	}, [canManageCourses, courseId, scopedLicenseCategory])

	const handleActivate = async () => {
		if (!courseId) return
		setActivating(true)
		setNotice("")
		setActionError("")
		const res = await courseService.activate(courseId)
		if (res.success) {
			setCourse(res.data)
			setNotice(getUpdateCourseSuccessMessage())
		} else {
			setActionError(getUpdateCourseErrorMessage(res))
		}
		setActivating(false)
	}

	const handleArchive = async () => {
		if (
			!courseId ||
			!window.confirm(
				"Lưu trữ khóa học này? Học sinh sẽ không thể đăng ký mới.",
			)
		)
			return
		setArchiving(true)
		setNotice("")
		setActionError("")
		const res = await courseService.archive(courseId)
		if (res.success) {
			setCourse(res.data)
			setNotice(getDeleteCourseSuccessMessage())
		} else {
			setActionError(getDeleteCourseErrorMessage(res))
		}
		setArchiving(false)
	}

	const handleDeleteLesson = async (lessonId: string) => {
		if (!courseId || !window.confirm("Xác nhận xóa bài học này?")) return
		setDeletingLesson(lessonId)
		const res = await courseService.deleteLesson(courseId, lessonId)
		if (res.success) setCourse(res.data)
		setDeletingLesson(null)
	}

	const goBack = () => navigate("/courses")
	const goEdit = () => navigate(`/courses/${courseId}/edit`)

	return {
		courseId,
		course,
		setCourse,
		loading,
		error,
		notice,
		actionError,
		canManageCourses,
		canArchiveCourses,
		activating,
		archiving,
		deletingLesson,
		handleActivate,
		handleArchive,
		handleDeleteLesson,
		goBack,
		goEdit,
	}
}
