import { useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { analyticsService, userService } from "@/services"
import { useAsyncData } from "@/hooks/useAsyncData"
import type { InstructorProfile } from "@/types"
import type { UserProfile } from "@/types/user-profile.types"
import { getInitials } from "@/utils/format"
import { InstructorHeader } from "../DashboardGiangVienPage/InstructorHeader"
import { InstructorDashboardView } from "../DashboardGiangVienPage/InstructorDashboardView"
import { EMPTY_DASHBOARD } from "../DashboardGiangVienPage/dashboardData"
import "../DashboardGiangVienPage/index.css"

export default function AdminInstructorDashboardPage() {
	const { userId = "" } = useParams()
	const navigate = useNavigate()

	const loadDashboard = useCallback(
		() => analyticsService.getInstructorDashboardForAdmin(userId),
		[userId],
	)
	const { data, loading, error } = useAsyncData(loadDashboard, {
		initialData: EMPTY_DASHBOARD,
	})

	const loadProfile = useCallback(() => userService.getById(userId), [userId])
	const { data: profile } = useAsyncData<UserProfile | null>(loadProfile, {
		initialData: null,
	})

	const fullName = profile?.fullName ?? "Giảng viên"
	const instructor: InstructorProfile = {
		initials: getInitials(fullName),
		name: fullName,
		role: "Giảng viên",
	}

	const backButton = (
		<button
			onClick={() => navigate("/users")}
			style={{
				marginBottom: 16,
				padding: "8px 14px",
				background: "#2a2a2a",
				color: "#f0f0f0",
				border: "1px solid #3a3a3a",
				borderRadius: 8,
				cursor: "pointer",
				fontSize: 14,
			}}
		>
			← Quay lại danh sách người dùng
		</button>
	)

	if (loading) {
		return (
			<div className="gv-dashboard">
				{backButton}
				<InstructorHeader instructor={instructor} />
				<div className="gv-loading">Đang tải dữ liệu...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="gv-dashboard">
				{backButton}
				<InstructorHeader instructor={instructor} />
				<div className="gv-error">{error}</div>
			</div>
		)
	}

	return (
		<div className="gv-dashboard">
			{backButton}
			<InstructorDashboardView instructor={instructor} data={data} />
		</div>
	)
}
