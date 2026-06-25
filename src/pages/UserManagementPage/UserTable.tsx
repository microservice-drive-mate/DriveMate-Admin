import type { IdentityUser } from "@/types/identity.types"
import { getInitials } from "@/utils/format"
import { RoleBadge } from "./components/RoleBadge"
import { StatusCell } from "./components/StatusCell"
import { formatDate, getAvatarColor } from "./userTableUtils"

interface Props {
	users: IdentityUser[]
	togglingId: string | null
	deletingId: string | null
	onToggleStatus: (user: IdentityUser) => void
	onEdit: (user: IdentityUser) => void
	onChangeRole: (user: IdentityUser) => void
	onDelete: (user: IdentityUser) => void
	onResetPassword: (user: IdentityUser) => void
	onViewDashboard: (user: IdentityUser) => void
}

export default function UserTable({
	users,
	togglingId,
	deletingId,
	onToggleStatus,
	onEdit,
	onChangeRole,
	onDelete,
	onResetPassword,
	onViewDashboard,
}: Props) {
	if (users.length === 0) {
		return (
			<div className="user-table__empty">
				<p>Không tìm thấy người dùng nào.</p>
			</div>
		)
	}

	return (
		<div className="user-table-wrapper">
			<table className="user-table">
				<thead>
					<tr>
						<th>Họ Tên</th>
						<th>Email</th>
						<th>Vai Trò</th>
						<th>Trạng Thái</th>
						<th>Ngày Tạo</th>
						<th>Thao Tác</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => {
						const busy = togglingId === user.userId
						const deleting = deletingId === user.userId
						const disabled = busy || user.isDeleted
						return (
							<tr
								key={user.userId}
								className={
									user.isDeleted
										? "user-table__row--deleted"
										: ""
								}
							>
								<td>
									<div className="user-table__name-cell">
										<div
											className="user-table__avatar"
											style={{
												background: getAvatarColor(
													user.userId,
												),
											}}
										>
											{getInitials(user.fullName)}
										</div>
										<span className="user-table__fullname">
											{user.fullName}
										</span>
									</div>
								</td>
								<td className="user-table__email">
									{user.email}
								</td>
								<td>
									<RoleBadge role={user.role} />
								</td>
								<td>
									<StatusCell user={user} />
								</td>
								<td className="user-table__date">
									{formatDate(user.createdAt)}
								</td>
								<td>
									<div className="user-table__actions">
										<button
											className={`action-btn ${
												user.isActive
													? "action-btn--deactivate"
													: "action-btn--activate"
											}`}
											title={
												user.isActive
													? "Khóa đăng nhập"
													: "Mở khóa"
											}
											disabled={disabled}
											onClick={() => onToggleStatus(user)}
										>
											{busy
												? "..."
												: user.isActive
													? "⏸"
													: "▶"}
										</button>
										<button
											className="action-btn action-btn--edit"
											title="Sửa thông tin"
											disabled={disabled}
											onClick={() => onEdit(user)}
										>
											✎
										</button>
										<button
											className="action-btn action-btn--role"
											title="Đổi vai trò"
											disabled={disabled}
											onClick={() => onChangeRole(user)}
										>
											◆
										</button>
										{user.role === "INSTRUCTOR" && (
											<button
												className="action-btn action-btn--dashboard"
												title="Xem dashboard giảng viên"
												disabled={disabled}
												onClick={() =>
													onViewDashboard(user)
												}
											>
												📊
											</button>
										)}
										<button
											className="action-btn action-btn--reset-password"
											title="Đặt lại mật khẩu"
											disabled={disabled}
											onClick={() =>
												onResetPassword(user)
											}
										>
											🔑
										</button>
										<button
											className="action-btn action-btn--delete"
											title="Xóa người dùng"
											disabled={disabled || deleting}
											onClick={() => onDelete(user)}
										>
											{deleting ? "..." : "🗑"}
										</button>
									</div>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
