import { create } from "zustand";
import type { AuthState, AuthUser, LoginCredentials } from "../types";

interface AuthStore extends AuthState {
	login: (credentials: LoginCredentials) => void;
	logout: () => void;
	requestPasswordReset: (email: string) => void;
	verifyOTP: (otp: string) => boolean;
	resetPassword: (newPassword: string) => void;
	clearError: () => void;
	initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	user: null,
	token: null,
	isAuthenticated: false,
	loading: false,
	error: null,
	isResettingPassword: false,
	resetEmail: null,
	resetOtpVerified: false,

	initializeAuth: () => {
		// Check if token exists in localStorage on app init
		const token = localStorage.getItem("authToken");
		if (token) {
			// In production, verify token with backend
			const userStr = localStorage.getItem("authUser");
			if (userStr) {
				const user = JSON.parse(userStr);
				set({
					token,
					user,
					isAuthenticated: true,
				});
			}
		}
	},

	login: (credentials: LoginCredentials) => {
		set({ loading: true, error: null });

		// Mock API call delay
		setTimeout(() => {
			// Demo: accept any email/password (you can add real validation)
			if (credentials.email && credentials.password) {
				const mockUser: AuthUser = {
					id: "1",
					email: credentials.email,
					role: "admin",
				};
				const mockToken = `token_${Date.now()}`;

				// Save to localStorage
				localStorage.setItem("authToken", mockToken);
				localStorage.setItem("authUser", JSON.stringify(mockUser));

				set({
					user: mockUser,
					token: mockToken,
					isAuthenticated: true,
					loading: false,
					error: null,
				});
			} else {
				set({
					loading: false,
					error: "Email và mật khẩu không được để trống",
				});
			}
		}, 500);
	},

	logout: () => {
		localStorage.removeItem("authToken");
		localStorage.removeItem("authUser");
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

	requestPasswordReset: (email: string) => {
		if (!email) {
			set({ error: "Vui lòng nhập email" });
			return;
		}

		// Mock: accept any email
		set({
			isResettingPassword: true,
			resetEmail: email,
			resetOtpVerified: false,
			error: null,
		});
	},

	verifyOTP: (otp: string): boolean => {
		// Mock OTP verification: accept any 6-digit number
		if (otp.length === 6 && /^\d+$/.test(otp)) {
			set({
				resetOtpVerified: true,
				error: null,
			});
			return true;
		} else {
			set({ error: "OTP không hợp lệ. Vui lòng nhập 6 chữ số" });
			return false;
		}
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

		// Mock: success
		set({
			isResettingPassword: false,
			resetEmail: null,
			resetOtpVerified: false,
			error: null,
		});

		// Clear localStorage to force login again
		localStorage.removeItem("authToken");
		localStorage.removeItem("authUser");
		set({
			user: null,
			token: null,
			isAuthenticated: false,
		});
	},

	clearError: () => {
		set({ error: null });
	},
}));
