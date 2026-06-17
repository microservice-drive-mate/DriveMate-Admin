import type { UserRole } from "@/types/identity.types"
import type { UserManagementFilters } from "./index"

interface Props {
	filters: UserManagementFilters
	onChange: (filters: UserManagementFilters) => void
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
	{ value: "ADMIN", label: "Admin" },
	{ value: "CENTER_MANAGER", label: "Center Manager" },
	{ value: "INSTRUCTOR", label: "Giảng viên" },
	{ value: "STUDENT", label: "Học viên" },
]

export default function UserFilters({ filters, onChange }: Props) {
	const update = (patch: Partial<UserManagementFilters>) =>
		onChange({ ...filters, ...patch })

	return (
		<div className="user-filters">
			<div className="user-filters__search">
				<span className="user-filters__search-icon">⌕</span>
				<input
					className="user-filters__input"
					type="text"
					placeholder="Tìm kiếm theo tên, email..."
					value={filters.search}
					onChange={(e) => update({ search: e.target.value })}
				/>
			</div>

			<select
				className="user-filters__select"
				value={filters.role}
				onChange={(e) =>
					update({
						role: e.target.value as UserManagementFilters["role"],
					})
				}
			>
				<option value="">Vai trò</option>
				{ROLE_OPTIONS.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>

			<select
				className="user-filters__select"
				value={filters.isActive}
				onChange={(e) =>
					update({
						isActive: e.target
							.value as UserManagementFilters["isActive"],
					})
				}
			>
				<option value="">Trạng thái</option>
				<option value="true">Hoạt động</option>
				<option value="false">Tạm dừng</option>
			</select>

			<label className="user-filters__toggle">
				<input
					type="checkbox"
					checked={filters.includeDeleted}
					onChange={(e) =>
						update({ includeDeleted: e.target.checked })
					}
				/>
				<span>Gồm đã xóa</span>
			</label>

			<button
				className="user-filters__btn"
				onClick={() =>
					onChange({
						...filters,
						search: "",
						role: "",
						isActive: "",
						includeDeleted: false,
					})
				}
			>
				<span>⊘</span> Xóa lọc
			</button>
		</div>
	)
}
