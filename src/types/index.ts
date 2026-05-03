export interface NavItem {
	label: string;
	path: string;
	icon: string;
}

// Dashboard Types
export interface MonthlyTrend {
	month: string;
	hocVien: number;
	baiThi: number;
	dat: number;
}

export interface LicenseDistribution {
	name: string;
	value: number;
}

export interface PassRate {
	hang: string;
	rate: number;
}

export type ActivityStatus = "success" | "fail" | "neutral";

export interface RecentActivity {
	id: string;
	name: string;
	action: string;
	time: string;
	status: ActivityStatus;
}

// Auth Types
export interface AuthUser {
	id: string;
	email: string;
	role: "admin" | "staff" | "user";
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface ResetPasswordData {
	email: string;
	otp: string;
	newPassword: string;
	confirmPassword: string;
}

export interface AuthState {
	user: AuthUser | null;
	token: string | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: string | null;
	isResettingPassword: boolean;
	resetEmail: string | null;
	resetOtpVerified: boolean;
}
