import { Navigate, createBrowserRouter } from "react-router-dom"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AdminLayout } from "@/components/layout/AdminLayout"
import AddCoursePage from "@/pages/AddCoursePage"
import AddExamConfigPage from "@/pages/AddExamConfigPage"
import AddQuestionPage from "@/pages/AddQuestionPage"
import AddStudentPage from "@/pages/AddStudentPage"
import AddUserPage from "@/pages/AddUserPage"
import AuditLogPage from "@/pages/AuditLogPage"
import CourseDetailPage from "@/pages/CourseDetailPage"
import CourseManagementPage from "@/pages/CourseManagementPage"
import { DashboardGiangVienPage } from "@/pages/DashboardGiangVienPage"
import { DashboardPage } from "@/pages/DashboardPage"
import ExamConfigManagementPage from "@/pages/ExamConfigManagementPage"
import { ForgotPasswordStep1 } from "@/pages/ForgotPasswordStep1"
import { LoginPage } from "@/pages/LoginPage"
import QuestionManagementPage from "@/pages/QuestionManagementPage"
import StudentDetailPage from "@/pages/StudentDetailPage"
import StudentManagementPage from "@/pages/StudentManagementPage"
import SystemHealthPage from "@/pages/SystemHealthPage"
import UserManagementPage from "@/pages/UserManagementPage"

export const appRouter = createBrowserRouter([
	{
		path: "/",
		element: <Navigate to="/dashboard" replace />,
	},
	{
		path: "/login",
		element: <LoginPage />,
	},
	{
		path: "/forgot-password",
		element: <ForgotPasswordStep1 />,
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
					{
						path: "exam-config",
						element: <ExamConfigManagementPage />,
					},
					{
						path: "exam-config/new",
						element: <AddExamConfigPage />,
					},
					{
						path: "exam-config/:configId/edit",
						element: <AddExamConfigPage />,
					},
					{
						path: "audit-logs",
						element: <AuditLogPage />,
					},
					{
						path: "system-health",
						element: <SystemHealthPage />,
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
])
