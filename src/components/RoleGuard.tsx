import { Navigate, Outlet } from "react-router-dom"
import type { UserRole } from "@/types/identity.types"
import { useAuthStore } from "@/store/authStore"

interface RoleGuardProps {
	allowedRoles: UserRole[]
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
	const user = useAuthStore((s) => s.user)

	if (!user?.role || !allowedRoles.includes(user.role)) {
		return <Navigate to="/forbidden" replace />
	}

	return <Outlet />
}
