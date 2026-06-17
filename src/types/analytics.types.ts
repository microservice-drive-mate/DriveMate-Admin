export interface ProgressTrend {
	date: string
	attempts: number
	correctAnswers: number
	questionsAnswered: number
}

export interface WeakTopic {
	topicId: string
	topicName: string
	incorrectCount: number
	accuracyRate: number
}

export interface ProgressDashboard {
	studentId: string
	completionPct: number
	studiedCount: number
	attemptCount: number
	passRate: number
	totalStudyMinutes: number
	avgExamScore: number
	trend: ProgressTrend[]
	weakTopics: WeakTopic[]
	lastActivityAt: string | null
}

export interface DashboardPeriod {
	month: string
	currentFrom: string
	currentTo: string
	previousFrom: string
	previousTo: string
}

export interface DashboardDelta {
	value: number
	percentage: number | null
	direction: "up" | "down" | "flat"
}

export interface DashboardCard {
	key: "students" | "courses" | "instructors" | "completedExams"
	label: string
	value: number
	previousValue: number
	delta: DashboardDelta
}

export interface MonthlyTrendPoint {
	month: string
	students: number
	completedExams: number
	passedExams: number
}

export interface LicenseDistributionItem {
	licenseCategory: string
	students: number
	percentage: number
}

export interface PassRateByLicenseItem {
	licenseCategory: string
	completedExams: number
	passedExams: number
	passRate: number
}

export interface AdminRecentActivity {
	id: string
	type: "student" | "course" | "exam" | "audit"
	title: string
	description: string
	resourceType: string
	resourceId: string
	licenseCategory?: string
	occurredAt: string
}

export interface AdminDashboard {
	period: DashboardPeriod
	cards: DashboardCard[]
	monthlyTrend: MonthlyTrendPoint[]
	licenseDistribution: LicenseDistributionItem[]
	passRateByLicense: PassRateByLicenseItem[]
	recentActivities: AdminRecentActivity[]
}

export interface InstructorDashboardPeriod {
	month: string
	weekStart: string
	date: string
	timezone: string
}

export interface InstructorDashboardSummary {
	activeClassCount: number
	totalStudents: number
	passRate: number
	teachingHoursThisMonth: number
}

export interface WeeklyTeachingTrendPoint {
	date: string
	label: string
	teachingHours: number
	studentCount: number
}

export interface TopicAverage {
	topicId: string
	topicName: string
	averageScore: number
	answeredQuestions: number
}

export interface ClassProgressItem {
	courseId: string
	title: string
	licenseCategory: string
	totalStudents: number
	completedStudents: number
	progressPct: number
}

export interface TodayScheduleItem {
	scheduleId: string
	courseId: string
	title: string
	startTime: string
	endTime: string
	room: string
	studentCount: number
}

export interface InstructorDashboard {
	period: InstructorDashboardPeriod
	summary: InstructorDashboardSummary
	weeklyTeachingTrend: WeeklyTeachingTrendPoint[]
	topicAverages: TopicAverage[]
	classProgress: ClassProgressItem[]
	todaySchedule: TodayScheduleItem[]
}
