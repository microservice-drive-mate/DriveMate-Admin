import type { LicenseTier } from "./user-profile.types"

export type LicenseCategory = LicenseTier

export interface TopicDistributionItem {
	topicId: string
	questionCount: number
}

export interface ExamTemplate {
	id: string
	name: string
	description?: string
	licenseCategory: LicenseCategory
	totalQuestions: number
	passingScore: number
	durationMinutes: number
	criticalQuestions: number
	maxCriticalMistakes: number
	shuffleQuestions: boolean
	topicDistribution: TopicDistributionItem[]
	isActive: boolean
	isDeleted: boolean
	version: number
	createdById: string
	createdAt: string
	updatedAt: string
}

export interface CreateExamTemplatePayload {
	name: string
	description?: string
	licenseCategory: LicenseCategory
	totalQuestions: number
	passingScore: number
	durationMinutes: number
	criticalQuestions: number
	maxCriticalMistakes: number
	shuffleQuestions: boolean
	topicDistribution: TopicDistributionItem[]
}

export interface UpdateExamTemplatePayload {
	version: number
	name?: string
	description?: string
	totalQuestions?: number
	passingScore?: number
	durationMinutes?: number
	criticalQuestions?: number
	maxCriticalMistakes?: number
	shuffleQuestions?: boolean
	topicDistribution?: TopicDistributionItem[]
	isActive?: boolean
}

export interface DeleteExamTemplatePayload {
	version: number
}

export interface ExamTemplateListParams {
	page?: number
	size?: number
	licenseCategory?: LicenseCategory
	isActive?: boolean
	includeDeleted?: boolean
}

export interface ExamTemplateFormData {
	name: string
	description: string
	licenseCategory: LicenseCategory | ""
	totalQuestions: number
	passingScore: number
	durationMinutes: number
	criticalQuestions: number
	maxCriticalMistakes: number
	shuffleQuestions: boolean
	topicDistribution: TopicDistributionItem[]
	isActive: boolean
}

export const LICENSE_CATEGORIES: LicenseCategory[] = [
	"A1",
	"A2",
	"B1",
	"B2",
	"C",
	"D",
	"E",
	"F",
]

export const LICENSE_CATEGORY_DEFAULTS: Record<
	LicenseCategory,
	Pick<
		ExamTemplateFormData,
		"totalQuestions" | "passingScore" | "durationMinutes"
	>
> = {
	A1: { totalQuestions: 25, passingScore: 21, durationMinutes: 19 },
	A2: { totalQuestions: 25, passingScore: 21, durationMinutes: 19 },
	B1: { totalQuestions: 30, passingScore: 27, durationMinutes: 22 },
	B2: { totalQuestions: 35, passingScore: 32, durationMinutes: 25 },
	C: { totalQuestions: 40, passingScore: 36, durationMinutes: 30 },
	D: { totalQuestions: 45, passingScore: 41, durationMinutes: 32 },
	E: { totalQuestions: 45, passingScore: 41, durationMinutes: 32 },
	F: { totalQuestions: 45, passingScore: 41, durationMinutes: 32 },
}
