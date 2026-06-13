import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  CreateUserDocumentsPayload,
  CreateUserProfilePayload,
  LicenseTier,
  UpdateUserProfilePayload,
  UserDocument,
  UserListParams,
  UserProfile,
} from "@/types/user-profile.types";
import { apiService } from "@/lib";
import { withErrorHandling } from "@/utils";

const getByIdRaw = withErrorHandling((id: string) =>
  apiService.get<ApiResponse<UserProfile>>(`/admin/users/${id}`),
);

interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
}

async function getByIdWithRetry(id: string, opts: RetryOptions = {}) {
  const { retries = 5, baseDelayMs = 300 } = opts;
  let last: Awaited<ReturnType<typeof getByIdRaw>> | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    const result = await getByIdRaw(id);
    last = result;
    if (result.success) return result;
    // Only retry on 404 — that's the race condition while user-service
    // consumes the identity.user.created event from RabbitMQ.
    if (result.status !== 404) return result;
    if (attempt < retries - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, baseDelayMs * (attempt + 1)),
      );
    }
  }
  return last!;
}

export const userService = {
  list: withErrorHandling((params?: UserListParams) =>
    apiService.get<ApiResponse<PaginatedResponse<UserProfile>>>(
      "/admin/users",
      { params },
    ),
  ),

  getById: getByIdRaw,

  getByIdWithRetry,

  create: withErrorHandling((payload: CreateUserProfilePayload) =>
    apiService.post<ApiResponse<UserProfile>>("/admin/users", payload),
  ),

  update: withErrorHandling(
    (id: string, payload: UpdateUserProfilePayload) =>
      apiService.patch<ApiResponse<UserProfile>>(
        `/admin/users/${id}`,
        payload,
      ),
  ),

  setLock: withErrorHandling((id: string, lock: boolean) =>
    apiService.patch<ApiResponse<null>>(`/admin/users/${id}/lock`, { lock }),
  ),

  assignLicenseTier: withErrorHandling(
    (id: string, licenseTier: LicenseTier) =>
      apiService.patch<ApiResponse<UserProfile>>(
        `/admin/users/${id}/license-tier`,
        { licenseTier },
      ),
  ),

  uploadDocuments: withErrorHandling(
    (id: string, payload: CreateUserDocumentsPayload) =>
      apiService.post<ApiResponse<UserDocument[]>>(
        `/admin/users/${id}/documents`,
        payload,
      ),
  ),

  listDocuments: withErrorHandling((id: string) =>
    apiService.get<ApiResponse<UserDocument[]>>(
      `/admin/users/${id}/documents`,
    ),
  ),

  getMe: withErrorHandling(() =>
    apiService.get<ApiResponse<UserProfile>>("/users/me"),
  ),

  updateMe: withErrorHandling((payload: UpdateUserProfilePayload) =>
    apiService.patch<ApiResponse<UserProfile>>("/users/me", payload),
  ),
};
