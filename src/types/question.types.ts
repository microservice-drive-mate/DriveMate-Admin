export type QuestionType = "THEORY" | "TRAFFIC_SIGN" | "SCENARIO_RELATED"
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD"
export type LicenseCategory = "A1" | "A2" | "B1" | "B2" | "C" | "D" | "E" | "F"
export type CriticalStatus = "" | "critical" | "normal"

export interface QuestionOption {
	id: string
	content: string
	isCorrect: boolean
	displayOrder: number
}

export interface TopicResponse {
	id: string
	name: string
	description: string | null
	parentId: string | null
	createdAt: string
}

export interface QuestionResponse {
	id: string
	content: string
	type: QuestionType
	licenseCategories: LicenseCategory[]
	difficulty: QuestionDifficulty
	explanation: string
	imageUrl: string | null
	mediaFileId: string | null
	isCritical: boolean
	isActive: boolean
	isDeleted: boolean
	topicId: string
	createdById: string
	version: number
	deletedById: string | null
	deletedAt: string | null
	createdAt: string
	updatedAt: string
	options: QuestionOption[]
}

export interface QuestionFilters {
	keyword: string
	licenseCategory: LicenseCategory | ""
	type: QuestionType | ""
	difficulty: QuestionDifficulty | ""
	topicId: string
	criticalStatus: CriticalStatus
	includeDeleted: boolean
}

export interface QuestionFormOption {
	id?: string
	content: string
	isCorrect: boolean
	displayOrder: number
}

export interface QuestionPayloadOption {
	content: string
	isCorrect: boolean
	displayOrder: number
}

export interface QuestionFormData {
	content: string
	type: QuestionType | ""
	licenseCategories: LicenseCategory[]
	difficulty: QuestionDifficulty | ""
	explanation: string
	isCritical: boolean
	isActive: boolean
	topicId: string
	options: QuestionFormOption[]
}

export interface CreateQuestionPayload {
	content: string
	type: QuestionType
	licenseCategories: LicenseCategory[]
	difficulty: QuestionDifficulty
	explanation: string
	isCritical: boolean
	isActive: boolean
	topicId: string
	options: QuestionPayloadOption[]
	imageUrl?: string | null
	mediaFileId?: string | null
}

export interface UpdateQuestionPayload extends Partial<CreateQuestionPayload> {
	version: number
}

export const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
	EASY: "Dễ",
	MEDIUM: "TB",
	HARD: "Khó",
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
	THEORY: "Lý thuyết",
	TRAFFIC_SIGN: "Biển báo",
	SCENARIO_RELATED: "Tình huống",
}

export const LICENSE_CATEGORY_OPTIONS: LicenseCategory[] = [
	"A1",
	"A2",
	"B1",
	"B2",
	"C",
	"D",
	"E",
	"F",
]

export const DIFFICULTY_OPTIONS: {
	value: QuestionDifficulty
	label: string
}[] = [
	{ value: "EASY", label: "Dễ" },
	{ value: "MEDIUM", label: "TB" },
	{ value: "HARD", label: "Khó" },
]

export const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
	{ value: "THEORY", label: "Lý thuyết" },
	{ value: "TRAFFIC_SIGN", label: "Biển báo" },
	{ value: "SCENARIO_RELATED", label: "Tình huống" },
]
