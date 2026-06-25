import type { InstructorDashboard } from "@/types/analytics.types"

export const EMPTY_DASHBOARD: InstructorDashboard = {
	period: { month: "", weekStart: "", date: "", timezone: "" },
	summary: {
		activeClassCount: 0,
		totalStudents: 0,
		passRate: 0,
		teachingHoursThisMonth: 0,
	},
	weeklyTeachingTrend: [],
	topicAverages: [],
	classProgress: [],
	todaySchedule: [],
}
