import type { UserRole } from "@/types/identity.types"

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
	"/dashboard": ["ADMIN", "CENTER_MANAGER"],
	"/dashboard/giang-vien": ["ADMIN", "CENTER_MANAGER", "INSTRUCTOR"],
	"/users": ["ADMIN", "CENTER_MANAGER"],
	"/students": ["ADMIN", "CENTER_MANAGER"],
	"/courses": ["ADMIN", "CENTER_MANAGER", "INSTRUCTOR"],
	"/questions": ["ADMIN", "CENTER_MANAGER"],
	"/exam-config": ["ADMIN", "CENTER_MANAGER"],
	"/audit-logs": ["ADMIN", "CENTER_MANAGER"],
	"/system-health": ["ADMIN"],
}

export function hasRouteAccess(
	role: UserRole | undefined,
	path: string,
): boolean {
	if (!role) return false

	for (const [routePrefix, allowedRoles] of Object.entries(
		ROUTE_PERMISSIONS,
	)) {
		if (path === routePrefix || path.startsWith(routePrefix + "/")) {
			return allowedRoles.includes(role)
		}
	}

	return false
}

export function getDefaultRouteForRole(role: UserRole | undefined): string {
	switch (role) {
		case "ADMIN":
		case "CENTER_MANAGER":
			return "/dashboard"
		case "INSTRUCTOR":
			return "/dashboard/giang-vien"
		default:
			return "/forbidden"
	}
}
