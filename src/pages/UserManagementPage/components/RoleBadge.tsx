import type { UserRole } from "@/types/identity.types";
import { ROLE_LABELS } from "@/types/identity.types";

const ROLE_BADGE_CLASS: Record<UserRole, string> = {
	ADMIN: "badge badge--admin",
	CENTER_MANAGER: "badge badge--manager",
	INSTRUCTOR: "badge badge--instructor",
	STUDENT: "badge badge--student",
};

interface RoleBadgeProps {
	role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
	return <span className={ROLE_BADGE_CLASS[role]}>{ROLE_LABELS[role]}</span>;
}
