import { Navigate, createBrowserRouter } from "react-router-dom"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { RoleGuard } from "@/components/RoleGuard"
import { AdminLayout } from "@/components/layout/AdminLayout"
import AddCoursePage from "@/pages/AddCoursePage"
import AddExamConfigPage from "@/pages/AddExamConfigPage"
import AddQuestionPage from "@/pages/AddQuestionPage"
import AddStudentPage from "@/pages/AddStudentPage"
import AddUserPage from "@/pages/AddUserPage"
import AdminInstructorDashboardPage from "@/pages/AdminInstructorDashboardPage"
import AuditLogPage from "@/pages/AuditLogPage"
import CourseDetailPage from "@/pages/CourseDetailPage"
import CourseManagementPage from "@/pages/CourseManagementPage"
import { DashboardGiangVienPage } from "@/pages/DashboardGiangVienPage"
import { DashboardPage } from "@/pages/DashboardPage"
import ExamConfigManagementPage from "@/pages/ExamConfigManagementPage"
import { ForbiddenPage } from "@/pages/ForbiddenPage"
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
		path: "/forbidden",
		element: <ForbiddenPage />,
	},
	{
		element: <ProtectedRoute />,
		children: [
			{
				element: <AdminLayout />,
				children: [
					// INSTRUCTOR only
					{
						element: <RoleGuard allowedRoles={["INSTRUCTOR"]} />,
						children: [
							{
								path: "dashboard/giang-vien",
								element: <DashboardGiangVienPage />,
							},
						],
					},
					// ADMIN + CENTER_MANAGER + INSTRUCTOR
					{
						element: (
							<RoleGuard
								allowedRoles={[
									"ADMIN",
									"CENTER_MANAGER",
									"INSTRUCTOR",
								]}
							/>
						),
						children: [
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
						],
					},
					// ADMIN + CENTER_MANAGER
					{
						element: (
							<RoleGuard
								allowedRoles={["ADMIN", "CENTER_MANAGER"]}
							/>
						),
						children: [
							{
								path: "dashboard",
								element: <DashboardPage />,
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
								path: "users/:userId/instructor-dashboard",
								element: <AdminInstructorDashboardPage />,
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
						],
					},
					// ADMIN only
					{
						element: <RoleGuard allowedRoles={["ADMIN"]} />,
						children: [
							{
								path: "system-health",
								element: <SystemHealthPage />,
							},
						],
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
