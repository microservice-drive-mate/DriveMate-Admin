import type {
  ApiResponse,
  LoginCredentials,
  LoginResponseWireData,
  LogoutResponseData,
} from "@/types";
import { normalizeLoginApiResponse, withErrorHandling } from "@/utils";
import { apiService } from "@/lib";

interface ForgotPasswordPayload {
  email: string;
}

export const authService = {
  login: withErrorHandling((credentials: LoginCredentials) =>
    apiService
      .post<ApiResponse<LoginResponseWireData>>("/auth/login", {
        username: credentials.email,
        password: credentials.password,
      })
      .then(normalizeLoginApiResponse),
  ),

  logout: withErrorHandling((refreshToken: string) =>
    apiService.post<ApiResponse<LogoutResponseData>>("/auth/logout", { refreshToken }),
  ),

  refreshToken: withErrorHandling((refreshToken: string) =>
    apiService
      .post<ApiResponse<LoginResponseWireData>>("/auth/refresh", { refreshToken })
      .then(normalizeLoginApiResponse),
  ),

  forgotPassword: withErrorHandling((payload: ForgotPasswordPayload) =>
    apiService.post<ApiResponse<{ message: string }>>("/auth/forgot-password", payload),
  ),
};
