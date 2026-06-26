import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { getDefaultRouteForRole } from "@/config/permissions"

export function ForbiddenPage() {
	const user = useAuthStore((s) => s.user)
	const navigate = useNavigate()

	const handleGoBack = () => {
		navigate(getDefaultRouteForRole(user?.role))
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				gap: 16,
				fontFamily: "inherit",
				color: "#1a1a1a",
			}}
		>
			<div
				style={{
					fontSize: 64,
					fontWeight: 700,
					color: "#e53e3e",
					lineHeight: 1,
				}}
			>
				403
			</div>
			<div style={{ fontSize: 20, fontWeight: 600 }}>
				Bạn không có quyền truy cập trang này
			</div>
			<div style={{ fontSize: 14, color: "#666" }}>
				Tài khoản của bạn không được phép xem nội dung này.
			</div>
			<button
				onClick={handleGoBack}
				style={{
					marginTop: 8,
					padding: "10px 24px",
					background: "#1a1a1a",
					color: "#fff",
					border: "none",
					borderRadius: 8,
					fontSize: 14,
					fontWeight: 500,
					cursor: "pointer",
				}}
			>
				Về trang chủ
			</button>
		</div>
	)
}
