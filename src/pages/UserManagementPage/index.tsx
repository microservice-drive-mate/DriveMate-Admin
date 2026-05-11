import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type {
	User,
	UserFilters as UserFiltersType,
} from "../../types/user.types";
import { MOCK_USERS } from "../../data/userData";
import UserFilters from "./UserFilters";
import UserTable from "./UserTable";
import Pagination from "./Pagination";
import "./UserManagementPage.css";

const PAGE_SIZE = 10;

export default function UserManagementPage() {
	const navigate = useNavigate();
	const [users, setUsers] = useState<User[]>(MOCK_USERS);
	const [filters, setFilters] = useState<UserFiltersType>({
		search: "",
		role: "",
		status: "",
	});
	const [currentPage, setCurrentPage] = useState(1);

	const filtered = useMemo(() => {
		const q = filters.search.toLowerCase();
		return users.filter((u) => {
			const matchSearch =
				!q ||
				`${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
				u.email.toLowerCase().includes(q);
			const matchRole = !filters.role || u.role === filters.role;
			const matchStatus = !filters.status || u.status === filters.status;
			return matchSearch && matchRole && matchStatus;
		});
	}, [users, filters]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const paginated = filtered.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
	);

	const handleFiltersChange = (next: UserFiltersType) => {
		setFilters(next);
		setCurrentPage(1);
	};

	const handleToggleStatus = (id: string) => {
		setUsers((prev) =>
			prev.map((u) =>
				u.id === id
					? {
							...u,
							status:
								u.status === "active" ? "inactive" : "active",
						}
					: u,
			),
		);
	};

	const handleView = () => {
		// TODO: navigate to detail page when implemented
	};

	const handleEdit = () => {
		// TODO: navigate to edit page when implemented
	};

	return (
		<div className="user-mgmt">
			<div className="user-mgmt__header">
				<div>
					<h1>Quản Lý Người Dùng</h1>
					<p>Quản lý tài khoản admin, center manager và giảng viên</p>
				</div>
				<button
					className="user-mgmt__add-btn"
					onClick={() => navigate("/users/new")}>
					+ Thêm Người Dùng
				</button>
			</div>

			<UserFilters
				filters={filters}
				onChange={handleFiltersChange}
			/>

			<UserTable
				users={paginated}
				onToggleStatus={handleToggleStatus}
				onView={handleView}
				onEdit={handleEdit}
			/>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onChange={setCurrentPage}
			/>
		</div>
	);
}
