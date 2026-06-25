import type { InstructorDashboard } from "@/types/analytics.types"
import { ENROLLMENT_STATUS_LABELS } from "@/types/course.types"
import type {
	InstructorProfile,
	InstructorStatCard,
	WeeklyTeachingData,
	TopicScore,
	ClassProgress,
	TodaySession,
} from "@/types"
import { InstructorHeader } from "./InstructorHeader"
import { StatCardsSection } from "./StatCardsSection"
import { ChartsSection } from "./ChartsSection"
import { ClassProgressSection } from "./ClassProgressSection"
import { TodayScheduleSection } from "./TodayScheduleSection"

function toStatCards(
	summary: InstructorDashboard["summary"],
): InstructorStatCard[] {
	return [
		{
			title: "Lớp đang dạy",
			value: String(summary.activeClassCount),
			icon: "📖",
			iconBg: "#f97316",
		},
		{
			title: "Tổng học viên",
			value: String(summary.totalStudents),
			icon: "👤",
			iconBg: "#10b981",
		},
		{
			title: "Tỷ lệ đậu",
			value: `${Math.round(summary.passRate)}%`,
			icon: "✅",
			iconBg: "#3b82f6",
		},
		{
			title: "Giờ dạy tháng này",
			value: `${summary.teachingHoursThisMonth}h`,
			icon: "🕐",
			iconBg: "#8b5cf6",
		},
	]
}

function toWeeklyData(
	trend: InstructorDashboard["weeklyTeachingTrend"],
): WeeklyTeachingData[] {
	return trend.map((pt) => ({
		day: pt.label,
		gioDay: pt.teachingHours,
		hocVien: pt.studentCount,
	}))
}

function toTopicScores(
	avgs: InstructorDashboard["topicAverages"],
): TopicScore[] {
	return avgs.map((t) => ({
		topic: t.topicName,
		score: Math.round(t.averageScore),
	}))
}

function toClassProgress(
	progress: InstructorDashboard["classProgress"],
): ClassProgress[] {
	return progress.map((c) => ({
		id: c.courseId,
		name: c.title,
		completed: c.completedStudents,
		total: c.totalStudents,
		percent: Math.round(c.progressPct),
		students: (c.students ?? []).map((s) => ({
			id: s.studentId,
			name: s.fullName,
			progress: Math.round(s.progress),
			status: ENROLLMENT_STATUS_LABELS[s.status],
		})),
	}))
}

function toTodaySessions(
	schedule: InstructorDashboard["todaySchedule"],
): TodaySession[] {
	return schedule.map((s) => ({
		id: s.scheduleId,
		timeRange: `${s.startTime}–${s.endTime}`,
		className: s.title,
		room: s.room,
		studentCount: s.studentCount,
	}))
}

interface InstructorDashboardViewProps {
	instructor: InstructorProfile
	data: InstructorDashboard
}

export function InstructorDashboardView({
	instructor,
	data,
}: InstructorDashboardViewProps) {
	return (
		<>
			<InstructorHeader instructor={instructor} />
			<StatCardsSection cards={toStatCards(data.summary)} />
			<ChartsSection
				weeklyData={toWeeklyData(data.weeklyTeachingTrend)}
				topicScores={toTopicScores(data.topicAverages)}
			/>
			<ClassProgressSection classes={toClassProgress(data.classProgress)} />
			<TodayScheduleSection
				sessions={toTodaySessions(data.todaySchedule)}
			/>
		</>
	)
}
