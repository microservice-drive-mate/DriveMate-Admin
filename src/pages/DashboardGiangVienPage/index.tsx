import { useCallback } from "react"
import { analyticsService } from "@/services"
import { useAsyncData } from "@/hooks/useAsyncData"
import { useAuthStore } from "@/store/authStore"
import type { InstructorProfile } from "@/types"
import { InstructorHeader } from "./InstructorHeader"
import { InstructorDashboardView } from "./InstructorDashboardView"
import { EMPTY_DASHBOARD } from "./dashboardData"
import "./index.css"

export function DashboardGiangVienPage() {
	const user = useAuthStore((s) => s.user)

	const load = useCallback(
		() => analyticsService.getInstructorDashboard(),
		[],
	)
	const { data, loading, error } = useAsyncData(load, {
		initialData: EMPTY_DASHBOARD,
	})

	const instructor: InstructorProfile = {
		initials: user?.email ? user.email.slice(0, 2).toUpperCase() : "GV",
		name: user?.email ? user.email.split("@")[0] : "Giảng viên",
		role: "Giảng viên",
	}

	if (loading) {
		return (
			<div className="gv-dashboard">
				<InstructorHeader instructor={instructor} />
				<div className="gv-loading">Đang tải dữ liệu...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="gv-dashboard">
				<InstructorHeader instructor={instructor} />
				<div className="gv-error">{error}</div>
			</div>
		)
	}

	return (
		<div className="gv-dashboard">
			<InstructorDashboardView instructor={instructor} data={data} />
		</div>
	)
}
