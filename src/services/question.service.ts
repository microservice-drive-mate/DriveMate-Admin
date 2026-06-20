import type { ApiResponse, PaginatedResponse } from "@/types"
import type {
	CreateQuestionPayload,
	QuestionFilters,
	QuestionResponse,
	TopicResponse,
	UpdateQuestionPayload,
} from "@/types/question.types"
import { apiService } from "@/lib"
import { withErrorHandling } from "@/utils"

interface TopicPayload {
	name: string
	description?: string
	parentId?: string | null
}

interface TopicListParams {
	page?: number
	size?: number
	parentId?: string
}

interface QuestionListParams extends Omit<Partial<QuestionFilters>, "criticalStatus"> {
	page?: number
	size?: number
	isActive?: boolean
	isCritical?: boolean
}

export const topicService = {
	list: withErrorHandling((params?: TopicListParams) =>
		apiService.get<ApiResponse<PaginatedResponse<TopicResponse>>>(
			"/admin/questions/topics",
			{ params },
		),
	),

	getById: withErrorHandling((id: string) =>
		apiService.get<ApiResponse<TopicResponse>>(
			`/admin/questions/topics/${id}`,
		),
	),

	create: withErrorHandling((payload: TopicPayload) =>
		apiService.post<ApiResponse<TopicResponse>>(
			"/admin/questions/topics",
			payload,
		),
	),

	update: withErrorHandling((id: string, payload: Partial<TopicPayload>) =>
		apiService.patch<ApiResponse<TopicResponse>>(
			`/admin/questions/topics/${id}`,
			payload,
		),
	),
}

export const questionService = {
	list: withErrorHandling((params?: QuestionListParams) =>
		apiService.get<ApiResponse<PaginatedResponse<QuestionResponse>>>(
			"/admin/questions",
			{ params },
		),
	),

	getById: withErrorHandling((id: string) =>
		apiService.get<ApiResponse<QuestionResponse>>(`/admin/questions/${id}`),
	),

	create: withErrorHandling((payload: CreateQuestionPayload) =>
		apiService.post<ApiResponse<QuestionResponse>>(
			"/admin/questions",
			payload,
		),
	),

	update: withErrorHandling((id: string, payload: UpdateQuestionPayload) =>
		apiService.patch<ApiResponse<QuestionResponse>>(
			`/admin/questions/${id}`,
			payload,
		),
	),

	delete: withErrorHandling((id: string, version: number) =>
		apiService.delete<ApiResponse<QuestionResponse>>(
			`/admin/questions/${id}`,
			{ data: { version } },
		),
	),
}
