import type { LicenseCategory } from "./exam-template.types"

export type ExamSessionStatus =
	| "IN_PROGRESS"
	| "COMPLETED"
	| "TIMED_OUT"
	| "CANCELLED"

export interface AdminExamSession {
	id: string
	studentId: string
	templateId: string
	licenseCategory: LicenseCategory
	status: ExamSessionStatus
	score: number | null
	isPassed: boolean | null
	failedByCritical: boolean
	criticalMistakes: number
	maxCriticalMistakes: number
	startedAt: string
	finishedAt: string | null
	expiresAt: string
}

export interface AdminExamSessionListParams {
	studentId?: string
	templateId?: string
	status?: ExamSessionStatus
	isPassed?: boolean
	from?: string
	to?: string
	page?: number
	size?: number
}

export const EXAM_SESSION_STATUS_LABELS: Record<ExamSessionStatus, string> = {
	IN_PROGRESS: "Đang làm",
	COMPLETED: "Hoàn thành",
	TIMED_OUT: "Hết giờ",
	CANCELLED: "Đã hủy",
}
