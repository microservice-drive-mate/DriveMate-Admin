import type { ApiResponse, PaginatedResponse } from "@/types"
import type { AuditLog, AuditLogListParams } from "@/types/audit.types"
import { apiService } from "@/lib"
import { withErrorHandling } from "@/utils"

export const auditService = {
	list: withErrorHandling((params?: AuditLogListParams) =>
		apiService.get<ApiResponse<PaginatedResponse<AuditLog>>>(
			"/admin/audit-logs",
			{ params },
		),
	),

	getById: withErrorHandling((id: string) =>
		apiService.get<ApiResponse<AuditLog>>(`/admin/audit-logs/${id}`),
	),
}
