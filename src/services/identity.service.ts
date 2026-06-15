import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  ChangeRoleResponse,
  CreateIdentityUserPayload,
  CreateIdentityUserResponse,
  IdentityUser,
  IdentityUserListParams,
  LockResponse,
  UpdateIdentityUserPayload,
  UserRole,
} from "@/types/identity.types";
import { apiService } from "@/lib";
import { withErrorHandling } from "@/utils";

export const identityService = {
  list: withErrorHandling((params?: IdentityUserListParams) =>
    apiService.get<ApiResponse<PaginatedResponse<IdentityUser>>>(
      "/admin/identity-users",
      { params },
    ),
  ),

  getById: withErrorHandling((id: string) =>
    apiService.get<ApiResponse<IdentityUser>>(`/admin/identity-users/${id}`),
  ),

  create: withErrorHandling((payload: CreateIdentityUserPayload) =>
    apiService.post<ApiResponse<CreateIdentityUserResponse>>(
      "/admin/identity-users",
      payload,
    ),
  ),

  update: withErrorHandling(
    (id: string, payload: UpdateIdentityUserPayload) =>
      apiService.patch<ApiResponse<IdentityUser>>(
        `/admin/identity-users/${id}`,
        payload,
      ),
  ),

  changeRole: withErrorHandling((id: string, role: UserRole) =>
    apiService.patch<ApiResponse<ChangeRoleResponse>>(
      `/admin/identity-users/${id}/role`,
      { role },
    ),
  ),

  setLock: withErrorHandling((id: string, locked: boolean) =>
    apiService.patch<ApiResponse<LockResponse>>(
      `/admin/identity-users/${id}/lock`,
      { locked },
    ),
  ),

  softDelete: withErrorHandling((id: string, deletedById: string) =>
    apiService.delete<ApiResponse<IdentityUser>>(
      `/admin/identity-users/${id}`,
      { data: { deletedById } },
    ),
  ),

  changePassword: withErrorHandling((currentPassword: string, newPassword: string) =>
    apiService.post<ApiResponse<null>>(
      '/auth/change-password',
      { currentPassword, newPassword },
    ),
  ),

  resetPassword: withErrorHandling((userId: string, newPassword: string) =>
    apiService.post<ApiResponse<null>>(
      '/auth/reset-password',
      { userId, newPassword },
    ),
  ),
};
