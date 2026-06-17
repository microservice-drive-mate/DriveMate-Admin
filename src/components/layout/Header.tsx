import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { NotificationBell } from "@/components/common/NotificationBell"
import { ChangePasswordModal } from "@/components/common/ChangePasswordModal"
import { userService } from "@/services"
import { useAuthStore } from "@/store/authStore"
import { getInitials } from "@/utils/format"
import "./Header.css"

const ROUTE_LABELS: Record<string, string> = {
	"/dashboard": "Overview Dashboard",
	"/dashboard/giang-vien": "Instructor Dashboard",
	"/users": "User Management",
	"/students": "Student Management",
	"/courses": "Course Management",
	"/questions": "Question Bank",
	"/exam-config": "Exam Configuration",
	"/system-health": "System Health",
}

export function Header() {
	const { pathname } = useLocation()
	const title = ROUTE_LABELS[pathname] ?? "DriveMate Admin"
	const authUser = useAuthStore((s) => s.user)
	const [fullName, setFullName] = useState("")
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
	const [dropdownOpen, setDropdownOpen] = useState(false)
	const [showChangePassword, setShowChangePassword] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		userService.getMe().then((res) => {
			if (res.success) {
				setFullName(res.data.fullName)
				setAvatarUrl(res.data.avatarUrl ?? null)
			}
		})
	}, [])

	useEffect(() => {
		if (!dropdownOpen) return
		const handleClick = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setDropdownOpen(false)
			}
		}
		document.addEventListener("mousedown", handleClick)
		return () => document.removeEventListener("mousedown", handleClick)
	}, [dropdownOpen])

	const displayName = fullName || authUser?.email || "Admin"
	const initials = fullName
		? getInitials(fullName)
		: (authUser?.email?.[0] ?? "A").toUpperCase()

	return (
		<>
			<header className="header">
				<span className="header__title">{title}</span>
				<div className="header__user">
					<NotificationBell />
					<span>{displayName}</span>
					<div className="header__avatar-wrap" ref={dropdownRef}>
						<div
							className="header__avatar"
							style={{ cursor: "pointer" }}
							onClick={() => setDropdownOpen((o) => !o)}
						>
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
						{dropdownOpen && (
							<div className="header__dropdown">
								<button
									className="header__dropdown-item"
									onClick={() => {
										setDropdownOpen(false)
										setShowChangePassword(true)
									}}
								>
									Đổi mật khẩu
								</button>
							</div>
						)}
					</div>
				</div>
			</header>

			{showChangePassword && (
				<ChangePasswordModal
					onClose={() => setShowChangePassword(false)}
					onSuccess={() => setShowChangePassword(false)}
				/>
			)}
		</>
	)
}
