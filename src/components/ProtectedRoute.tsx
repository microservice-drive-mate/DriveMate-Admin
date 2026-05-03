import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function ProtectedRoute() {
	const { isAuthenticated, token } = useAuthStore();

	// Check if user has a valid token
	const hasValidToken = !!token || !!localStorage.getItem("authToken");

	if (!isAuthenticated && !hasValidToken) {
		// Redirect to login if not authenticated
		return (
			<Navigate
				to="/login"
				replace
			/>
		);
	}

	// Render the protected content
	return <Outlet />;
}
