import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { AUTH_CONFIG } from "@/constants";

export function ProtectedRoute() {
	const { isAuthenticated, isInitializing } = useAuthStore();

	if (isInitializing) {
		return null;
	}

	const hasToken = !!localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_STORAGE_KEY);

	if (!isAuthenticated && !hasToken) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}
