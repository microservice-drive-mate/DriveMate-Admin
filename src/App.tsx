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
import { DashboardGiangVienPage } from "./pages/DashboardGiangVienPage";
import UserManagementPage from "./pages/UserManagementPage";
import AddUserPage from "./pages/AddUserPage";
import StudentManagementPage from "./pages/StudentManagementPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import AddStudentPage from "./pages/AddStudentPage";
import CourseManagementPage from "./pages/CourseManagementPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import AddCoursePage from "./pages/AddCoursePage";
import QuestionManagementPage from "./pages/QuestionManagementPage";
import AddQuestionPage from "./pages/AddQuestionPage";

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
					{
						path: "dashboard/giang-vien",
						element: <DashboardGiangVienPage />,
					},
					{
						path: "users",
						element: <UserManagementPage />,
					},
					{
						path: "users/new",
						element: <AddUserPage />,
					},
					{
						path: "students",
						element: <StudentManagementPage />,
					},
					{
						path: "students/new",
						element: <AddStudentPage />,
					},
					{
						path: "students/:studentId",
						element: <StudentDetailPage />,
					},
					{
						path: "courses",
						element: <CourseManagementPage />,
					},
					{
						path: "courses/new",
						element: <AddCoursePage />,
					},
					{
						path: "courses/:courseId",
						element: <CourseDetailPage />,
					},
					{
						path: "courses/:courseId/edit",
						element: <AddCoursePage />,
					},
					{
						path: "questions",
						element: <QuestionManagementPage />,
					},
					{
						path: "questions/new",
						element: <AddQuestionPage />,
					},
					{
						path: "questions/:id/edit",
						element: <AddQuestionPage />,
					},
				],
			},
		],
	},
	{
		path: "*",
		element: (
			<div style={{ padding: 40, textAlign: "center" }}>
				404 - Trang khong tim thay
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
