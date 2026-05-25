import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IdentityUser, UserRole } from "@/types/identity.types";
import { identityService } from "@/services";
import { useAuthStore } from "../../store/authStore";
import UserFilters from "./UserFilters";
import UserTable from "./UserTable";
import Pagination from "../../components/Pagination";
import { DEFAULT_PAGE_SIZE } from "../../constants/pagination";
import "./UserManagementPage.css";

export interface UserManagementFilters {
  search: string;
  role: UserRole | "";
  isActive: "" | "true" | "false";
}

const INITIAL_FILTERS: UserManagementFilters = {
  search: "",
  role: "",
  isActive: "",
};

export default function UserManagementPage() {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.user?.id ?? "");
  const [items, setItems] = useState<IdentityUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserManagementFilters>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal state
  const [editModal, setEditModal] = useState<IdentityUser | null>(null);
  const [roleModal, setRoleModal] = useState<IdentityUser | null>(null);
  const [editForm, setEditForm] = useState({ email: "", fullName: "" });
  const [roleValue, setRoleValue] = useState<UserRole>("STUDENT");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await identityService.list({
      page,
      size: DEFAULT_PAGE_SIZE,
      role: filters.role || undefined,
      isActive:
        filters.isActive === ""
          ? undefined
          : filters.isActive === "true",
      search: filters.search.trim() || undefined,
    });
    if (result.success) {
      setItems(result.data.items);
      setTotal(result.data.total);
    } else {
      setError(result.error);
      setItems([]);
      setTotal(0);
    }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

  const handleFiltersChange = (next: UserManagementFilters) => {
    setFilters(next);
    setPage(1);
  };

  const handleToggleStatus = async (user: IdentityUser) => {
    setTogglingId(user.userId);
    const result = await identityService.setLock(user.userId, user.isActive);
    setTogglingId(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    await fetchUsers();
  };

  const handleOpenEdit = (user: IdentityUser) => {
    setEditForm({ email: user.email, fullName: user.fullName });
    setModalError(null);
    setEditModal(user);
  };

  const handleEditSubmit = async () => {
    if (!editModal) return;
    setModalLoading(true);
    setModalError(null);
    const result = await identityService.update(editModal.userId, {
      email: editForm.email.trim() || undefined,
      fullName: editForm.fullName.trim() || undefined,
    });
    setModalLoading(false);
    if (!result.success) {
      setModalError(result.error);
      return;
    }
    setEditModal(null);
    await fetchUsers();
  };

  const handleOpenRole = (user: IdentityUser) => {
    setRoleValue(user.role);
    setModalError(null);
    setRoleModal(user);
  };

  const handleRoleSubmit = async () => {
    if (!roleModal) return;
    setModalLoading(true);
    setModalError(null);
    const result = await identityService.changeRole(roleModal.userId, roleValue);
    setModalLoading(false);
    if (!result.success) {
      setModalError(result.error);
      return;
    }
    setRoleModal(null);
    await fetchUsers();
  };

  const handleDelete = async (user: IdentityUser) => {
    if (!window.confirm(`Xóa tài khoản "${user.fullName}" (${user.email})? Thao tác này không thể hoàn tác.`)) return;
    setTogglingId(user.userId);
    const result = await identityService.softDelete(user.userId, currentUserId);
    setTogglingId(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    await fetchUsers();
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

      <UserFilters filters={filters} onChange={handleFiltersChange} />

      {error && <div className="user-mgmt__error">{error}</div>}

      {loading ? (
        <div className="user-mgmt__loading">Đang tải...</div>
      ) : (
        <UserTable
          users={items}
          togglingId={togglingId}
          onToggleStatus={handleToggleStatus}
          onEdit={handleOpenEdit}
          onChangeRole={handleOpenRole}
          onDelete={handleDelete}
        />
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onChange={setPage}
      />

      {editModal && (
        <div className="user-modal">
          <div className="user-modal__box">
            <p className="user-modal__title">Sửa thông tin — {editModal.fullName}</p>
            {modalError && <div className="user-modal__error">{modalError}</div>}
            <div className="user-modal__field">
              <label>Họ và tên</label>
              <input
                value={editForm.fullName}
                onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="user-modal__field">
              <label>Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div className="user-modal__actions">
              <button
                className="user-modal__btn user-modal__btn--primary"
                onClick={handleEditSubmit}
                disabled={modalLoading}>
                {modalLoading ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                className="user-modal__btn"
                onClick={() => setEditModal(null)}
                disabled={modalLoading}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {roleModal && (
        <div className="user-modal">
          <div className="user-modal__box">
            <p className="user-modal__title">Đổi vai trò — {roleModal.fullName}</p>
            {modalError && <div className="user-modal__error">{modalError}</div>}
            <div className="user-modal__field">
              <label>Vai trò mới</label>
              <select
                value={roleValue}
                onChange={(e) => setRoleValue(e.target.value as UserRole)}>
                <option value="ADMIN">Admin</option>
                <option value="CENTER_MANAGER">Center Manager</option>
                <option value="INSTRUCTOR">Giảng Viên</option>
                <option value="STUDENT">Học Viên</option>
              </select>
            </div>
            <div className="user-modal__actions">
              <button
                className="user-modal__btn user-modal__btn--primary"
                onClick={handleRoleSubmit}
                disabled={modalLoading}>
                {modalLoading ? "Đang lưu..." : "Đổi Role"}
              </button>
              <button
                className="user-modal__btn"
                onClick={() => setRoleModal(null)}
                disabled={modalLoading}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
