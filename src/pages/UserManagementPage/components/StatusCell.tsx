import type { IdentityUser } from "@/types/identity.types"
import { formatDate } from "../userTableUtils"

interface StatusCellProps {
	user: IdentityUser
}

export function StatusCell({ user }: StatusCellProps) {
	if (user.isDeleted) {
		return (
			<div className="user-table__status-cell">
				<span className="badge badge--deleted">Đã xóa</span>
				{user.deletedAt && (
					<span className="user-table__status-meta">
						{formatDate(user.deletedAt)}
					</span>
				)}
			</div>
		)
	}

	return (
		<span
			className={`badge ${user.isActive ? "badge--active" : "badge--inactive"}`}
		>
			{user.isActive ? "Hoạt động" : "Tạm dừng"}
		</span>
	)
}
