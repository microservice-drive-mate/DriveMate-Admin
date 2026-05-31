import type { IdentityUser } from "@/types/identity.types";
import { RoleBadge } from "./components/RoleBadge";
import { StatusCell } from "./components/StatusCell";
import { formatDate, getAvatarColor, getInitials } from "./userTableUtils";

interface Props {
  users: IdentityUser[];
  togglingId: string | null;
  onToggleStatus: (user: IdentityUser) => void;
  onEdit: (user: IdentityUser) => void;
  onChangeRole: (user: IdentityUser) => void;
  onDelete: (user: IdentityUser) => void;
}

export default function UserTable({
  users,
  togglingId,
  onToggleStatus,
  onEdit,
  onChangeRole,
  onDelete,
}: Props) {
  if (users.length === 0) {
    return (
      <div className="user-table__empty">
        <p>KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng nÃ o.</p>
      </div>
    );
  }

  return (
    <div className="user-table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            <th>Há» TÃªn</th>
            <th>Email</th>
            <th>Vai TrÃ²</th>
            <th>Tráº¡ng ThÃ¡i</th>
            <th>NgÃ y Táº¡o</th>
            <th>Thao TÃ¡c</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const busy = togglingId === user.userId;
            const disabled = busy || user.isDeleted;
            return (
              <tr key={user.userId} className={user.isDeleted ? "user-table__row--deleted" : ""}>
                <td>
                  <div className="user-table__name-cell">
                    <div
                      className="user-table__avatar"
                      style={{ background: getAvatarColor(user.userId) }}>
                      {getInitials(user.fullName)}
                    </div>
                    <span className="user-table__fullname">{user.fullName}</span>
                  </div>
                </td>
                <td className="user-table__email">{user.email}</td>
                <td>
                  <RoleBadge role={user.role} />
                </td>
                <td>
                  <StatusCell user={user} />
                </td>
                <td className="user-table__date">{formatDate(user.createdAt)}</td>
                <td>
                  <div className="user-table__actions">
                    <button
                      className={`action-btn ${
                        user.isActive
                          ? "action-btn--deactivate"
                          : "action-btn--activate"
                      }`}
                      title={user.isActive ? "KhÃ³a Ä‘Äƒng nháº­p" : "Má»Ÿ khÃ³a"}
                      disabled={disabled}
                      onClick={() => onToggleStatus(user)}>
                      {busy ? "..." : user.isActive ? "â¸" : "â–¶"}
                    </button>
                    <button
                      className="action-btn action-btn--edit"
                      title="Sá»­a thÃ´ng tin"
                      disabled={disabled}
                      onClick={() => onEdit(user)}>
                      âœŽ
                    </button>
                    <button
                      className="action-btn action-btn--role"
                      title="Äá»•i vai trÃ²"
                      disabled={disabled}
                      onClick={() => onChangeRole(user)}>
                      â—†
                    </button>
                    <button
                      className="action-btn action-btn--delete"
                      title="XÃ³a tÃ i khoáº£n"
                      disabled={disabled}
                      onClick={() => onDelete(user)}>
                      Ã—
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
