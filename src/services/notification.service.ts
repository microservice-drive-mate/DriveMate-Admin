import type { ApiResponse, PaginatedResponse } from "@/types"
import type {
	Notification,
	NotificationListParams,
	SendAcademicWarningPayload,
} from "@/types/notification.types"
import { apiService } from "@/lib"
import { withErrorHandling } from "@/utils"

export const notificationService = {
	sendAcademicWarning: withErrorHandling(
		(payload: SendAcademicWarningPayload) =>
			apiService.post<ApiResponse<Notification>>(
				"/admin/academic-warnings",
				payload,
			),
	),

	getMyNotifications: withErrorHandling((params?: NotificationListParams) =>
		apiService.get<ApiResponse<PaginatedResponse<Notification>>>(
			"/notifications/me",
			{ params },
		),
	),

	markRead: withErrorHandling((id: string) =>
		apiService.patch<ApiResponse<Notification>>(
			`/notifications/${id}/read`,
			{},
		),
	),
}
