import { create } from "zustand";
import type { AuthState, AuthUser, LoginCredentials, UserRole } from "../types";
import { authService } from "@/services";
import { AUTH_CONFIG } from "@/constants";
import {
  getAuthToken,
  getStorageItem,
  getUserData,
  removeAuthToken,
  removeStorageItem,
  removeUserData,
  setAuthToken,
  setStorageItem,
  setUserData,
} from "@/utils";

interface AuthStore extends AuthState {
  isInitializing: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyOTP: (otp: string) => boolean;
  resetPassword: (newPassword: string) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

function extractRoleFromJwt(payload: Record<string, unknown>): UserRole {
  const realmAccess = payload?.realm_access as { roles?: string[] } | undefined;
  const roles = realmAccess?.roles ?? [];
  const priority: UserRole[] = ["ADMIN", "CENTER_MANAGER", "INSTRUCTOR", "STUDENT"];
  for (const role of priority) {
    if (roles.includes(role)) return role;
  }
  return "STUDENT";
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isInitializing: true,
  isResettingPassword: false,
  resetEmail: null,
  resetOtpVerified: false,

  initializeAuth: async () => {
    set({ isInitializing: true });
    const token = await getAuthToken();
    if (token) {
      const user = await getUserData();
      if (user) {
        set({ token, user, isAuthenticated: true, isInitializing: false });
        return;
      }
    }
    set({ isInitializing: false });
  },

  login: async (credentials: LoginCredentials) => {
    set({ loading: true, error: null });

    const result = await authService.login(credentials);

    if (!result.success) {
      set({ loading: false, error: result.error });
      return;
    }

    const { accessToken, refreshToken } = result.data;
    const payload = decodeJwtPayload(accessToken);
    const user: AuthUser = {
      id: (payload.sub as string) ?? "",
      email: (payload.email as string) ?? credentials.email,
      role: extractRoleFromJwt(payload),
    };

    await setAuthToken(accessToken);
    await setStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    await setUserData(user);

    set({ user, token: accessToken, isAuthenticated: true, loading: false, error: null });
  },

  logout: async () => {
    const refreshToken = await getStorageItem<string>(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
    if (refreshToken) {
      await authService.logout();
    }
    await removeAuthToken();
    await removeUserData();
    await removeStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
      isResettingPassword: false,
      resetEmail: null,
      resetOtpVerified: false,
    });
  },

  requestPasswordReset: async (email: string) => {
    if (!email) {
      set({ error: "Vui lòng nhập email" });
      return;
    }

    set({ loading: true, error: null });
    const result = await authService.forgotPassword({ email });

    if (!result.success) {
      set({ loading: false, error: result.error });
      return;
    }

    set({ loading: false, isResettingPassword: true, resetEmail: email, error: null });
  },

  verifyOTP: (otp: string): boolean => {
    if (otp.length === 6 && /^\d+$/.test(otp)) {
      set({ resetOtpVerified: true, error: null });
      return true;
    }
    set({ error: "OTP không hợp lệ. Vui lòng nhập 6 chữ số" });
    return false;
  },

  resetPassword: (newPassword: string) => {
    const state = get();
    if (!state.resetEmail || !state.resetOtpVerified) {
      set({ error: "Không thể đặt lại mật khẩu. Vui lòng thử lại." });
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      set({ error: "Mật khẩu phải có ít nhất 8 ký tự" });
      return;
    }
    set({
      isResettingPassword: false,
      resetEmail: null,
      resetOtpVerified: false,
      error: null,
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
