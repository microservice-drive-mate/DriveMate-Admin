import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { NotificationBell } from "@/components/common/NotificationBell";
import { userService } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { getInitials } from "@/utils/format";
import "./Header.css";

const ROUTE_LABELS: Record<string, string> = {
	"/dashboard": "Overview Dashboard",
	"/dashboard/giang-vien": "Instructor Dashboard",
	"/users": "User Management",
	"/students": "Student Management",
	"/courses": "Course Management",
	"/questions": "Question Bank",
	"/exam-config": "Exam Configuration",
	"/system-health": "System Health",
};

export function Header() {
	const { pathname } = useLocation();
	const title = ROUTE_LABELS[pathname] ?? "DriveMate Admin";
	const authUser = useAuthStore((s) => s.user);
	const [fullName, setFullName] = useState("");
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

	useEffect(() => {
		userService.getMe().then((res) => {
			if (res.success) {
				setFullName(res.data.fullName);
				setAvatarUrl(res.data.avatarUrl ?? null);
			}
		});
	}, []);

	const displayName = fullName || authUser?.email || "Admin";
	const initials = fullName
		? getInitials(fullName)
		: (authUser?.email?.[0] ?? "A").toUpperCase();

	return (
		<header className="header">
			<span className="header__title">{title}</span>
			<div className="header__user">
				<NotificationBell />
				<span>{displayName}</span>
				<div className="header__avatar">
					{avatarUrl ? (
						<img
							src={avatarUrl}
							alt={displayName}
							style={{
								width: "100%",
								height: "100%",
								borderRadius: "50%",
								objectFit: "cover",
							}}
						/>
					) : (
						initials
					)}
				</div>
			</div>
		</header>
	);
}
