import type { ApiResponse, AuthUser, LoginCredentials } from "@/types";
import { withErrorHandling } from "@/utils";
import { apiService } from "@/lib";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginResponseData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface VerifyOTPPayload {
  email: string;
  otp: string;
}

interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export const authService = {
  login: withErrorHandling((credentials: LoginCredentials) =>
    apiService.post<ApiResponse<LoginResponseData>>("/auth/login", credentials),
  ),

  logout: withErrorHandling(() =>
    apiService.post<ApiResponse<null>>("/auth/logout"),
  ),

  refreshToken: withErrorHandling((refreshToken: string) =>
    apiService.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken }),
  ),

  forgotPassword: withErrorHandling((payload: ForgotPasswordPayload) =>
    apiService.post<ApiResponse<{ message: string }>>("/auth/forgot-password", payload),
  ),

  verifyOTP: withErrorHandling((payload: VerifyOTPPayload) =>
    apiService.post<ApiResponse<{ message: string }>>("/auth/verify-otp", payload),
  ),

  resetPassword: withErrorHandling((payload: ResetPasswordPayload) =>
    apiService.post<ApiResponse<{ message: string }>>("/auth/reset-password", payload),
  ),
};
