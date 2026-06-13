import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
	CreateExamTemplatePayload,
	ExamTemplate,
	ExamTemplateListParams,
	UpdateExamTemplatePayload,
} from "@/types/exam-template.types";
import type {
	AdminExamSession,
	AdminExamSessionListParams,
} from "@/types/exam-session.types";
import type { QuestionResponse } from "@/types/question.types";
import { apiService } from "@/lib";
import { withErrorHandling } from "@/utils";

export const examService = {
	list: withErrorHandling((params?: ExamTemplateListParams) =>
		apiService.get<ApiResponse<PaginatedResponse<ExamTemplate>>>(
			"/admin/exams/templates",
			{ params },
		),
	),

	getById: withErrorHandling((id: string) =>
		apiService.get<ApiResponse<ExamTemplate>>(
			`/admin/exams/templates/${id}`,
		),
	),

	create: withErrorHandling((payload: CreateExamTemplatePayload) =>
		apiService.post<ApiResponse<ExamTemplate>>(
			"/admin/exams/templates",
			payload,
		),
	),

	update: withErrorHandling(
		(id: string, payload: UpdateExamTemplatePayload) =>
			apiService.patch<ApiResponse<ExamTemplate>>(
				`/admin/exams/templates/${id}`,
				payload,
			),
	),

	softDelete: withErrorHandling((id: string, version: number) =>
		apiService.delete<ApiResponse<ExamTemplate>>(
			`/admin/exams/templates/${id}`,
			{ data: { version } },
		),
	),

	getTemplateQuestions: withErrorHandling((id: string) =>
		apiService.get<ApiResponse<QuestionResponse[]>>(
			`/admin/exams/templates/${id}/questions`,
		),
	),

	listSessions: withErrorHandling((params?: AdminExamSessionListParams) =>
		apiService.get<ApiResponse<PaginatedResponse<AdminExamSession>>>(
			"/admin/exams/sessions",
			{ params },
		),
	),
};
