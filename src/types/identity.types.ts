export type UserRole = "ADMIN" | "CENTER_MANAGER" | "INSTRUCTOR" | "STUDENT"

export interface IdentityUser {
	userId: string
	email: string
	fullName: string
	role: UserRole
	isActive: boolean
	isDeleted: boolean
	deletedAt: string | null
	createdAt: string
	updatedAt: string
}

export interface CreateIdentityUserPayload {
	email: string
	fullName: string
	role: UserRole
	temporaryPassword: string
}

export interface UpdateIdentityUserPayload {
	email?: string
	fullName?: string
}

export interface IdentityUserListParams {
	page?: number
	size?: number
	role?: UserRole
	isActive?: boolean
	includeDeleted?: boolean
	search?: string
}

export interface CreateIdentityUserResponse {
	userId: string
	email: string
	fullName: string
	role: UserRole
}

export interface ChangeRoleResponse {
	userId: string
	role: UserRole
}

export interface LockResponse {
	userId: string
	locked: boolean
}

export const ROLE_LABELS: Record<UserRole, string> = {
	ADMIN: "Admin",
	CENTER_MANAGER: "Center Manager",
	INSTRUCTOR: "Giảng viên",
	STUDENT: "Học viên",
}
