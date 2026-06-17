import { create } from "zustand"
import type {
	AuthState,
	AuthUser,
	LicenseTier,
	LoginCredentials,
	UserRole,
} from "../types"
import { authService, userService } from "@/services"
import { AUTH_CONFIG } from "@/constants"
import {
	getForgotPasswordErrorMessage,
	getAuthToken,
	getStorageItem,
	getUserData,
	getLoginErrorMessage,
	removeAuthToken,
	removeStorageItem,
	removeUserData,
	SRS_MESSAGES,
	setAuthToken,
	setStorageItem,
	setUserData,
} from "@/utils"

interface AuthStore extends AuthState {
	isInitializing: boolean
	passwordResetEmailSent: boolean
	login: (credentials: LoginCredentials) => Promise<void>
	logout: () => Promise<void>
	requestPasswordReset: (email: string) => Promise<void>
	clearError: () => void
	clearPasswordResetStatus: () => void
	initializeAuth: () => Promise<void>
}

function decodeJwtPayload(token: string): Record<string, unknown> {
	try {
		const payload = token.split(".")[1]
		const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
		return JSON.parse(decoded)
	} catch {
		return {}
	}
}

function extractRoleFromJwt(payload: Record<string, unknown>): UserRole {
	const realmAccess = payload?.realm_access as
		| { roles?: string[] }
		| undefined
	const roles = realmAccess?.roles ?? []
	const priority: UserRole[] = [
		"ADMIN",
		"CENTER_MANAGER",
		"INSTRUCTOR",
		"STUDENT",
	]
	for (const role of priority) {
		if (roles.includes(role)) return role
	}
	return "STUDENT"
}

function extractLicenseTierFromJwt(payload: Record<string, unknown>) {
	return (payload.licenseTier ??
		payload.license_tier ??
		payload.licenseCategory ??
		payload.license_category ??
		null) as LicenseTier | null
}

async function hydrateAuthUser(user: AuthUser): Promise<AuthUser> {
	const profile = await userService.getMe()
	if (!profile.success) return user

	return {
		id: profile.data.id,
		email: profile.data.email,
		role: profile.data.role,
		licenseTier: profile.data.studentDetail?.licenseTier ?? null,
	}
}

export const useAuthStore = create<AuthStore>((set) => ({
	user: null,
	token: null,
	isAuthenticated: false,
	loading: false,
	error: null,
	isInitializing: true,
	passwordResetEmailSent: false,

	initializeAuth: async () => {
		set({ isInitializing: true })
		const token = await getAuthToken()
		if (token) {
			const user = await getUserData()
			if (user) {
				const hydratedUser = await hydrateAuthUser(user)
				await setUserData(hydratedUser)
				set({
					token,
					user: hydratedUser,
					isAuthenticated: true,
					isInitializing: false,
				})
				return
			}
		}
		set({ isInitializing: false })
	},

	login: async (credentials: LoginCredentials) => {
		set({ loading: true, error: null })

		const result = await authService.login(credentials)

		if (!result.success) {
			set({ loading: false, error: getLoginErrorMessage(result) })
			return
		}

		const { accessToken, refreshToken } = result.data
		const payload = decodeJwtPayload(accessToken)
		const user: AuthUser = {
			id: (payload.sub as string) ?? "",
			email: (payload.email as string) ?? credentials.email,
			role: extractRoleFromJwt(payload),
			licenseTier: extractLicenseTierFromJwt(payload),
		}

		await setAuthToken(accessToken)
		await setStorageItem(
			AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
			refreshToken,
		)
		const hydratedUser = await hydrateAuthUser(user)
		await setUserData(hydratedUser)

		set({
			user: hydratedUser,
			token: accessToken,
			isAuthenticated: true,
			loading: false,
			error: null,
		})
	},

	logout: async () => {
		const refreshToken = await getStorageItem<string>(
			AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
		)
		if (refreshToken) {
			await authService.logout(refreshToken)
		}
		await removeAuthToken()
		await removeUserData()
		await removeStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY)

		set({
			user: null,
			token: null,
			isAuthenticated: false,
			error: null,
			passwordResetEmailSent: false,
		})
	},

	requestPasswordReset: async (email: string) => {
		if (!email) {
			set({ error: SRS_MESSAGES.MSG04 })
			return
		}

		set({ loading: true, error: null, passwordResetEmailSent: false })
		const result = await authService.forgotPassword({ email })

		if (!result.success) {
			set({
				loading: false,
				error: getForgotPasswordErrorMessage(result),
			})
			return
		}

		set({ loading: false, passwordResetEmailSent: true, error: null })
	},

	clearError: () => {
		set({ error: null })
	},

	clearPasswordResetStatus: () => {
		set({ passwordResetEmailSent: false, error: null })
	},
}))
