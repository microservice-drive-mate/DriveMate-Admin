import type { ApiResponse } from "@/types"
import type {
	AdminDashboard,
	InstructorDashboard,
	ProgressDashboard,
} from "@/types/analytics.types"
import { apiService } from "@/lib"
import { withErrorHandling } from "@/utils"

export const analyticsService = {
	getStudentProgress: withErrorHandling((studentId: string) =>
		apiService.get<ApiResponse<ProgressDashboard>>(
			`/admin/analytics/students/${studentId}/progress`,
		),
	),

	getDashboard: withErrorHandling((month?: string) =>
		apiService.get<ApiResponse<AdminDashboard>>(
			"/admin/analytics/dashboard",
			{ params: month ? { month } : undefined },
		),
	),

	getInstructorDashboard: withErrorHandling(
		(params?: { month?: string; weekStart?: string; date?: string }) =>
			apiService.get<ApiResponse<InstructorDashboard>>(
				"/analytics/instructor/dashboard",
				{ params },
			),
	),

	getInstructorDashboardForAdmin: withErrorHandling(
		(
			instructorId: string,
			params?: { month?: string; weekStart?: string; date?: string },
		) =>
			apiService.get<ApiResponse<InstructorDashboard>>(
				`/admin/analytics/instructors/${instructorId}/dashboard`,
				{ params },
			),
	),
}
