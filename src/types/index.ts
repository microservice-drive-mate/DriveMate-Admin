import type { ReactNode } from 'react';
import type { UserRole } from "./identity.types";

export * from "./api.types";
export * from "./identity.types";
export * from "./user-profile.types";
export * from "./exam-template.types";
export * from "./media.types";

export interface NavItem {
	label: string;
	path: string;
	icon: ReactNode;
}

// UI Component Types
export type StatCardVariant = 'light' | 'dark';
export type ChangeType = 'positive' | 'negative';
export type ButtonVariant = 'primary' | 'secondary';

export interface AdminStatCard {
	title: string;
	value: string;
	icon: string;
	iconBg: string;
	change?: string;
	changeLabel?: string;
	changeType?: ChangeType;
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
	role: UserRole;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface LoginResponseData {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	refreshExpiresIn: number;
	tokenType: string;
	scope: string;
}

export interface LogoutResponseData {
	success: boolean;
	message: string;
	instruction: string;
}

export interface AuthState {
	user: AuthUser | null;
	token: string | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: string | null;
}

// Instructor Dashboard Types
export interface InstructorProfile {
	initials: string;
	name: string;
	role: string;
}

export interface InstructorStatCard {
	title: string;
	value: string;
	icon: string;
	iconBg: string;
}

export interface WeeklyTeachingData {
	day: string;
	gioDay: number;
	hocVien: number;
}

export interface TopicScore {
	topic: string;
	score: number;
}

export interface ClassProgress {
	id: string;
	name: string;
	completed: number;
	total: number;
	percent: number;
}

export interface TodaySession {
	id: string;
	timeRange: string;
	className: string;
	room: string;
	studentCount: number;
}
