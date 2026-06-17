import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { IdentityUser, UserRole } from "@/types/identity.types"
import { identityService, userService } from "@/services"
import { useAuthStore } from "@/store/authStore"
import { usePaginatedList } from "@/hooks/usePaginatedList"
import type { PaginatedLoaderParams } from "@/hooks/usePaginatedList"
import {
	getLockAccountErrorMessage,
	getLockAccountSuccessMessage,
} from "@/utils/srsMessages"
import Toast from "../../components/ui/Toast"
import Pagination from "../../components/Pagination"
import UserFilters from "./UserFilters"
import UserTable from "./UserTable"
import { EditUserModal } from "./components/EditUserModal"
import { ChangeRoleModal } from "./components/ChangeRoleModal"
import { ResetPasswordModal } from "@/components/common/ResetPasswordModal"
import "./UserManagementPage.css"

export interface UserManagementFilters {
	search: string
	role: UserRole | ""
	isActive: "" | "true" | "false"
	includeDeleted: boolean
}

interface ToastState {
	message: string
	type: "success" | "error"
	visible: boolean
}

const INITIAL_FILTERS: UserManagementFilters = {
	search: "",
	role: "",
	isActive: "",
	includeDeleted: false,
}

export default function UserManagementPage() {
	const navigate = useNavigate()
	const [toast, setToast] = useState<ToastState>({
		message: "",
		type: "success",
		visible: false,
	})
	const currentUserId = useAuthStore((state) => state.user?.id ?? "")
	const [togglingId, setTogglingId] = useState<string | null>(null)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [actionError, setActionError] = useState<string | null>(null)
	const [editUser, setEditUser] = useState<IdentityUser | null>(null)
	const [roleUser, setRoleUser] = useState<IdentityUser | null>(null)
	const [resetPasswordUser, setResetPasswordUser] =
		useState<IdentityUser | null>(null)

	const loadUsers = useCallback(
		({
			page,
			pageSize,
			filters,
		}: PaginatedLoaderParams<UserManagementFilters>) =>
			identityService.list({
				page,
				size: pageSize,
				role: filters.role || undefined,
				isActive:
					filters.isActive === ""
						? undefined
						: filters.isActive === "true",
				includeDeleted: filters.includeDeleted || undefined,
				search: filters.search.trim() || undefined,
			}),
		[],
	)

	const list = usePaginatedList<IdentityUser, UserManagementFilters>(
		loadUsers,
		{
			initialFilters: INITIAL_FILTERS,
		},
	)

	const showToast = (message: string, type: ToastState["type"]) => {
		setToast({ message, type, visible: true })
	}

	const hideToast = () =>
		setToast((current) => ({ ...current, visible: false }))

	const handleFiltersChange = (next: UserManagementFilters) => {
		setActionError(null)
		hideToast()
		list.setFilters(next)
	}

	const handlePageChange = (next: number) => {
		setActionError(null)
		list.setPage(next)
	}

	const handleToggleStatus = async (user: IdentityUser) => {
		if (user.isDeleted) return
		setActionError(null)
		hideToast()
		setTogglingId(user.userId)
		const result = await identityService.setLock(user.userId, user.isActive)
		if (!result.success) {
			setTogglingId(null)
			setActionError(getLockAccountErrorMessage(result))
			return
		}
		// best-effort: sync user-service profile lock; Keycloak lock is the primary gate
		await userService.setLock(user.userId, user.isActive)
		setTogglingId(null)
		showToast(getLockAccountSuccessMessage(user.isActive), "success")
		list.refetch()
	}

	const handleDelete = async (user: IdentityUser) => {
		if (
			!window.confirm(
				`Xóa người dùng "${user.fullName}"? Thao tác này soft delete.`,
			)
		)
			return
		setActionError(null)
		hideToast()
		setDeletingId(user.userId)
		const result = await identityService.softDelete(
			user.userId,
			currentUserId,
		)
		setDeletingId(null)
		if (!result.success) {
			setActionError(result.error)
			return
		}
		showToast("Đã xóa người dùng.", "success")
		list.refetch()
	}

	const handleSaved = (message: string) => {
		setEditUser(null)
		setRoleUser(null)
		showToast(message, "success")
		list.refetch()
	}

	const handleResetPasswordSuccess = () => {
		setResetPasswordUser(null)
		showToast("Đã đặt lại mật khẩu thành công.", "success")
	}

	const displayError = list.error ?? actionError

	return (
		<div className="user-mgmt">
			<Toast
				message={toast.message}
				type={toast.type}
				visible={toast.visible}
				onClose={hideToast}
			/>

			<div className="user-mgmt__header">
				<div>
					<h1>Quản Lý Người Dùng</h1>
					<p>Quản lý tài khoản, hồ sơ, trạng thái và hạng bằng lái</p>
				</div>
				<button
					className="user-mgmt__add-btn"
					onClick={() => navigate("/users/new")}
				>
					+ Thêm Người Dùng
				</button>
			</div>

			<UserFilters
				filters={list.filters}
				onChange={handleFiltersChange}
			/>

			{displayError && (
				<div className="user-mgmt__error">{displayError}</div>
			)}

			{list.loading ? (
				<div className="user-mgmt__loading">Đang tải...</div>
			) : (
				<UserTable
					users={list.items}
					togglingId={togglingId}
					deletingId={deletingId}
					onToggleStatus={handleToggleStatus}
					onEdit={setEditUser}
					onChangeRole={setRoleUser}
					onDelete={handleDelete}
					onResetPassword={setResetPasswordUser}
				/>
			)}

			<Pagination
				currentPage={list.page}
				totalPages={list.totalPages}
				onChange={handlePageChange}
			/>

			{editUser && (
				<EditUserModal
					user={editUser}
					onClose={() => setEditUser(null)}
					onSaved={handleSaved}
					onListChanged={list.refetch}
				/>
			)}

			{roleUser && (
				<ChangeRoleModal
					user={roleUser}
					onClose={() => setRoleUser(null)}
					onSaved={handleSaved}
					onListChanged={list.refetch}
				/>
			)}

			{resetPasswordUser && (
				<ResetPasswordModal
					userId={resetPasswordUser.userId}
					userFullName={resetPasswordUser.fullName}
					onClose={() => setResetPasswordUser(null)}
					onSuccess={handleResetPasswordSuccess}
				/>
			)}
		</div>
	)
}
