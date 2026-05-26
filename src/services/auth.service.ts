import type {
  ApiResponse,
  LoginCredentials,
  LoginResponseData,
  LogoutResponseData,
} from "@/types";
import { withErrorHandling } from "@/utils";
import { apiService } from "@/lib";

interface ForgotPasswordPayload {
  email: string;
}

export const authService = {
  login: withErrorHandling((credentials: LoginCredentials) =>
    apiService.post<ApiResponse<LoginResponseData>>("/auth/login", {
      username: credentials.email,
      password: credentials.password,
    }),
  ),

  logout: withErrorHandling((refreshToken: string) =>
    apiService.post<ApiResponse<LogoutResponseData>>("/auth/logout", { refreshToken }),
  ),

  refreshToken: withErrorHandling((refreshToken: string) =>
    apiService.post<ApiResponse<LoginResponseData>>("/auth/refresh", { refreshToken }),
  ),

  forgotPassword: withErrorHandling((payload: ForgotPasswordPayload) =>
    apiService.post<ApiResponse<{ message: string }>>("/auth/forgot-password", payload),
  ),
};
