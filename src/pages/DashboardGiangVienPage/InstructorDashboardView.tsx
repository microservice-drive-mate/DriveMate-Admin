import type { InstructorDashboard } from "@/types/analytics.types"
import { ENROLLMENT_STATUS_LABELS } from "@/types/course.types"
import type {
	InstructorProfile,
	InstructorStatCard,
	WeeklyTeachingData,
	TopicScore,
	ClassProgress,
} from "@/types"
import { InstructorHeader } from "./InstructorHeader"
import { StatCardsSection } from "./StatCardsSection"
import { ChartsSection } from "./ChartsSection"
import { ClassProgressSection } from "./ClassProgressSection"

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

// Tên topic chưa resolve được trả về dạng ID (hex + dấu gạch, đủ dài).
// Mẫu này không bao giờ khớp tên topic tiếng Việt thật (có khoảng trắng/dấu).
const UUID_RE = /^[0-9a-f-]{30,}$/i

function toTopicScores(
	avgs: InstructorDashboard["topicAverages"],
): TopicScore[] {
	// Backend đôi khi không resolve được tên topic (orphan) và trả về ID.
	// Thay bằng nhãn chung để không lòi ID ra UI; đánh số khi có nhiều hơn một.
	const unknownTotal = avgs.filter((t) => UUID_RE.test(t.topicName)).length
	let unknownIdx = 0
	return avgs.map((t) => {
		let topic = t.topicName
		if (UUID_RE.test(t.topicName)) {
			unknownIdx += 1
			topic =
				unknownTotal > 1 ? `Chủ đề khác ${unknownIdx}` : "Chủ đề khác"
		}
		return { topic, score: Math.round(t.averageScore) }
	})
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
			email: s.email,
			licenseTier: s.licenseTier,
			progress: Math.round(s.progress),
			status: ENROLLMENT_STATUS_LABELS[s.status],
			enrolledAt: s.enrolledAt,
			completedAt: s.completedAt,
		})),
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
			<ClassProgressSection
				classes={toClassProgress(data.classProgress)}
			/>
		</>
	)
}
