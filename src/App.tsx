import { useEffect } from "react";
import {
	createBrowserRouter,
	RouterProvider,
	Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordStep1 } from "./pages/ForgotPasswordStep1";
import { ForgotPasswordStep2 } from "./pages/ForgotPasswordStep2";
import { CreateNewPasswordPage } from "./pages/CreateNewPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";

const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<Navigate
				to="/dashboard"
				replace
			/>
		),
	},
	{
		path: "/login",
		element: <LoginPage />,
	},
	{
		path: "/forgot-password/step1",
		element: <ForgotPasswordStep1 />,
	},
	{
		path: "/forgot-password/step2",
		element: <ForgotPasswordStep2 />,
	},
	{
		path: "/forgot-password/step3",
		element: <CreateNewPasswordPage />,
	},
	{
		element: <ProtectedRoute />,
		children: [
			{
				element: <AdminLayout />,
				children: [
					{
						path: "dashboard",
						element: <DashboardPage />,
					},
				],
			},
		],
	},
	{
		path: "*",
		element: (
			<div style={{ padding: 40, textAlign: "center" }}>
				404 — Trang không tìm thấy
			</div>
		),
	},
]);

function AppContent() {
	const { initializeAuth } = useAuthStore();

	useEffect(() => {
		// Initialize auth on app load (restore session from localStorage)
		initializeAuth();
	}, [initializeAuth]);

	return <RouterProvider router={router} />;
}

export default function App() {
	return <AppContent />;
}
