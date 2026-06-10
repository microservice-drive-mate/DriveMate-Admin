import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { SidebarIcon, type SidebarIconId } from "./SidebarIcon";
import "./Sidebar.css";

const NAV_ITEMS: Array<{ label: string; path: string; icon: SidebarIconId }> = [
	{ label: "Dashboard Tổng Quan", path: "/dashboard", icon: "dashboard" },
	{
		label: "Dashboard Giảng Viên",
		path: "/dashboard/giang-vien",
		icon: "user",
	},
	{ label: "Quản Lý Người Dùng", path: "/users", icon: "users" },
	// { label: 'Quản Lý Học Viên', path: '/students', icon: 'graduation' },
	{ label: "Quản Lý Khóa Học", path: "/courses", icon: "book" },
	{ label: "Ngân Hàng Câu Hỏi", path: "/questions", icon: "document" },
	{ label: "Cấu Hình Đề Thi", path: "/exam-config", icon: "settings" },
	{ label: "Audit Logs", path: "/audit-logs", icon: "shield" },
	{ label: "System Health", path: "/system-health", icon: "pulse" },
];

interface SidebarProps {
	collapsed: boolean;
	onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
	const logout = useAuthStore((s) => s.logout);
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<aside className={`sidebar${collapsed ? " sidebar--collapsed" : ""}`}>
			<div className="sidebar__logo">
				<div className="sidebar__logo-icon">
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="#1a1a1a"
						strokeWidth="2.2"
						strokeLinecap="round"
						strokeLinejoin="round">
						<path d="M22 10v6M2 10l10-5 10 5-10 5z" />
						<path d="M6 12v5c3 3 9 3 12 0v-5" />
					</svg>
				</div>
				{!collapsed && (
					<div className="sidebar__logo-texts">
						<span className="sidebar__logo-text">DriveMate</span>
						<span className="sidebar__logo-sub">
							Quản Lý Luyện Thi
						</span>
					</div>
				)}
				<button
					className="sidebar__close"
					onClick={onToggle}
					aria-label="Toggle sidebar">
					{collapsed ? <SidebarIcon id="menu" /> : "×"}
				</button>
			</div>

			<nav className="sidebar__nav">
				{NAV_ITEMS.map((item) => (
					<NavLink
						key={item.path}
						to={item.path}
						end={item.path === "/dashboard"}
						title={collapsed ? item.label : undefined}
						className={({ isActive }) =>
							`sidebar__nav-item${isActive ? " sidebar__nav-item--active" : ""}`
						}>
						<span className="sidebar__nav-icon">
							<SidebarIcon id={item.icon} />
						</span>
						{!collapsed && item.label}
					</NavLink>
				))}
			</nav>

			<div className="sidebar__footer">
				<button
					className="sidebar__logout"
					onClick={handleLogout}
					title={collapsed ? "Đăng Xuất" : undefined}>
					<span className="sidebar__nav-icon">
						<SidebarIcon id="logout" />
					</span>
					{!collapsed && "Đăng Xuất"}
				</button>
			</div>
		</aside>
	);
}
