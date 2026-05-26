import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IdentityUser, UserRole } from "@/types/identity.types";
import type {
  Gender,
  LicenseTier,
  UserProfile,
} from "@/types/user-profile.types";
import { LICENSE_TIERS } from "@/types/user-profile.types";
import type { MediaReference } from "@/types/media.types";
import { identityService, userService } from "@/services";
import { ImageUploader } from "@/components/common/ImageUploader";
import { validateEmail } from "@/utils/authUtils";
import {
  getLicenseAssignmentErrorMessage,
  getLockAccountErrorMessage,
  getLockAccountSuccessMessage,
  getUpdateAccountErrorMessage,
  getUpdateAccountSuccessMessage,
  getSrsMessage,
} from "@/utils/srsMessages";
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
  includeDeleted: boolean;
}

interface AccountEditForm {
  email: string;
  fullName: string;
}

interface ProfileEditForm {
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender | "";
  address: string;
  notes: string;
}

const INITIAL_FILTERS: UserManagementFilters = {
  search: "",
  role: "",
  isActive: "",
  includeDeleted: false,
};

const EMPTY_PROFILE_FORM: ProfileEditForm = {
  phoneNumber: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  notes: "",
};

function toDateInput(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

function profileToForm(profile: UserProfile): ProfileEditForm {
  return {
    phoneNumber: profile.phoneNumber ?? "",
    dateOfBirth: toDateInput(profile.dateOfBirth),
    gender: profile.gender ?? "",
    address: profile.address ?? "",
    notes: profile.studentDetail?.notes ?? "",
  };
}

function profileToAvatar(profile: UserProfile): MediaReference | null {
  if (!profile.mediaFileId) return null;
  return {
    mediaFileId: profile.mediaFileId,
    publicUrl: profile.avatarUrl ?? "",
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForStudentProfile(id: string) {
  let last: Awaited<ReturnType<typeof userService.getById>> | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const result = await userService.getById(id);
    last = result;
    if (result.success && result.data.role === "STUDENT" && result.data.studentDetail) {
      return result;
    }
    if (attempt < 4) await delay(300 * (attempt + 1));
  }
  return last;
}

export default function UserManagementPage() {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.user?.id ?? "");
  const [items, setItems] = useState<IdentityUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserManagementFilters>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [editModal, setEditModal] = useState<IdentityUser | null>(null);
  const [roleModal, setRoleModal] = useState<IdentityUser | null>(null);
  const [editForm, setEditForm] = useState<AccountEditForm>({
    email: "",
    fullName: "",
  });
  const [profileForm, setProfileForm] =
    useState<ProfileEditForm>(EMPTY_PROFILE_FORM);
  const [profileAvatar, setProfileAvatar] = useState<MediaReference | null>(null);
  const [profileLicenseTier, setProfileLicenseTier] =
    useState<LicenseTier | "">("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [roleValue, setRoleValue] = useState<UserRole>("STUDENT");
  const [roleLicenseTier, setRoleLicenseTier] = useState<LicenseTier | "">("");
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
      includeDeleted: filters.includeDeleted || undefined,
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
    void Promise.resolve().then(fetchUsers);
  }, [fetchUsers]);

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

  const handleFiltersChange = (next: UserManagementFilters) => {
    setFilters(next);
    setPage(1);
    setNotice(null);
  };

  const handleToggleStatus = async (user: IdentityUser) => {
    if (user.isDeleted) return;
    setError(null);
    setNotice(null);
    setTogglingId(user.userId);
    const result = await identityService.setLock(user.userId, user.isActive);
    setTogglingId(null);
    if (!result.success) {
      setError(getLockAccountErrorMessage(result, "user"));
      return;
    }
    setNotice(getLockAccountSuccessMessage(user.isActive, "user"));
    await fetchUsers();
  };

  const hydrateProfileForm = (profile: UserProfile) => {
    setProfileForm(profileToForm(profile));
    setProfileAvatar(profileToAvatar(profile));
    setProfileLicenseTier(profile.studentDetail?.licenseTier ?? "");
  };

  const handleOpenEdit = async (user: IdentityUser) => {
    setEditForm({ email: user.email, fullName: user.fullName });
    setProfileForm(EMPTY_PROFILE_FORM);
    setProfileAvatar(null);
    setProfileLicenseTier("");
    setModalError(null);
    setEditModal(user);
    setProfileLoading(true);

    const result = await userService.getById(user.userId);
    if (result.success) {
      hydrateProfileForm(result.data);
    } else {
      setModalError(getUpdateAccountErrorMessage(result, "user"));
    }
    setProfileLoading(false);
  };

  const validateEdit = () => {
    if (!editForm.fullName.trim()) {
      return getSrsMessage("MSG13", "user");
    }
    if (!editForm.email.trim()) {
      return getSrsMessage("MSG13", "user");
    }
    if (!validateEmail(editForm.email.trim())) {
      return getSrsMessage("MSG13", "user");
    }
    const normalizedPhone = profileForm.phoneNumber.replace(/\s+/g, "");
    if (normalizedPhone && !/^[0-9]{9,11}$/.test(normalizedPhone)) {
      return getSrsMessage("MSG13", "user");
    }
    return null;
  };

  const handleEditSubmit = async () => {
    if (!editModal) return;
    setNotice(null);
    const validationError = validateEdit();
    if (validationError) {
      setModalError(validationError);
      return;
    }

    setModalLoading(true);
    setModalError(null);

    const identityResult = await identityService.update(editModal.userId, {
      email: editForm.email.trim(),
      fullName: editForm.fullName.trim(),
    });

    if (!identityResult.success) {
      setModalLoading(false);
      setModalError(getUpdateAccountErrorMessage(identityResult, "user"));
      return;
    }

    const profileResult = await userService.update(editModal.userId, {
      phoneNumber: profileForm.phoneNumber.trim() || undefined,
      dateOfBirth: profileForm.dateOfBirth || undefined,
      gender: profileForm.gender || undefined,
      address: profileForm.address.trim() || undefined,
      notes: profileForm.notes.trim() || undefined,
      avatarUrl: profileAvatar?.publicUrl,
      mediaFileId: profileAvatar?.mediaFileId,
    });

    if (!profileResult.success) {
      setModalLoading(false);
      setModalError(
        `Account was updated, but profile update failed: ${getUpdateAccountErrorMessage(profileResult, "user")}`,
      );
      return;
    }

    if (editModal.role === "STUDENT" && profileLicenseTier) {
      const licenseResult = await userService.assignLicenseTier(
        editModal.userId,
        profileLicenseTier,
      );
      if (!licenseResult.success) {
        setModalLoading(false);
        setModalError(
          `Profile was updated, but license assignment failed: ${getLicenseAssignmentErrorMessage(licenseResult)}`,
        );
        return;
      }
    }

    setModalLoading(false);
    setEditModal(null);
    setNotice(getUpdateAccountSuccessMessage("user"));
    await fetchUsers();
  };

  const handleOpenRole = async (user: IdentityUser) => {
    setRoleValue(user.role);
    setRoleLicenseTier("");
    setModalError(null);
    setRoleModal(user);

    if (user.role === "STUDENT") {
      setModalLoading(true);
      const result = await userService.getById(user.userId);
      if (result.success) {
        setRoleLicenseTier(result.data.studentDetail?.licenseTier ?? "");
      }
      setModalLoading(false);
    }
  };

  const handleRoleSubmit = async () => {
    if (!roleModal) return;
    setNotice(null);
    setModalLoading(true);
    setModalError(null);
    const result = await identityService.changeRole(roleModal.userId, roleValue);
    if (!result.success) {
      setModalLoading(false);
      setModalError(getUpdateAccountErrorMessage(result, "user"));
      return;
    }

    if (roleValue === "STUDENT" && roleLicenseTier) {
      const profileResult = await waitForStudentProfile(roleModal.userId);
      if (!profileResult?.success) {
        setModalLoading(false);
        setModalError(
          `Role was updated, but the student profile is still syncing: ${
            profileResult?.success === false
              ? getUpdateAccountErrorMessage(profileResult, "user")
              : "Please try again later."
          }`,
        );
        return;
      }

      const licenseResult = await userService.assignLicenseTier(
        roleModal.userId,
        roleLicenseTier,
      );
      if (!licenseResult.success) {
        setModalLoading(false);
        setModalError(
          `Role was updated, but license assignment failed: ${getLicenseAssignmentErrorMessage(licenseResult)}`,
        );
        return;
      }
    }

    setModalLoading(false);
    setRoleModal(null);
    setNotice(getUpdateAccountSuccessMessage("user"));
    await fetchUsers();
  };

  const handleDelete = async (user: IdentityUser) => {
    if (user.isDeleted) return;
    if (!window.confirm(`Xóa tài khoản "${user.fullName}" (${user.email})? Thao tác này không thể hoàn tác.`)) return;
    setError(null);
    setNotice(null);
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
          <p>Quản lý tài khoản, hồ sơ, trạng thái và hạng bằng lái</p>
        </div>
        <button
          className="user-mgmt__add-btn"
          onClick={() => navigate("/users/new")}>
          + Thêm Người Dùng
        </button>
      </div>

      <UserFilters filters={filters} onChange={handleFiltersChange} />

      {error && <div className="user-mgmt__error">{error}</div>}
      {notice && <div className="user-mgmt__notice">{notice}</div>}

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
          <div className="user-modal__box user-modal__box--wide">
            <p className="user-modal__title">Sửa người dùng - {editModal.fullName}</p>
            {modalError && <div className="user-modal__error">{modalError}</div>}
            {profileLoading && (
              <div className="user-modal__loading">Đang tải profile...</div>
            )}

            <div className="user-modal__section">
              <h3>Account</h3>
              <div className="user-modal__grid">
                <div className="user-modal__field">
                  <label>Họ và tên</label>
                  <input
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="user-modal__field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="user-modal__section">
              <h3>Profile</h3>
              <div className="user-modal__profile-layout">
                <div className="user-modal__avatar">
                  <ImageUploader
                    value={profileAvatar}
                    onChange={setProfileAvatar}
                    shape="circle"
                    helpText="Tùy chọn - JPG, PNG, WebP"
                    disabled={profileLoading || modalLoading}
                  />
                </div>
                <div className="user-modal__profile-fields">
                  <div className="user-modal__grid">
                    <div className="user-modal__field">
                      <label>Số điện thoại</label>
                      <input
                        value={profileForm.phoneNumber}
                        onChange={(e) =>
                          setProfileForm((f) => ({
                            ...f,
                            phoneNumber: e.target.value,
                          }))
                        }
                        placeholder="0901234567"
                      />
                    </div>
                    <div className="user-modal__field">
                      <label>Ngày sinh</label>
                      <input
                        type="date"
                        value={profileForm.dateOfBirth}
                        onChange={(e) =>
                          setProfileForm((f) => ({
                            ...f,
                            dateOfBirth: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="user-modal__field">
                      <label>Giới tính</label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) =>
                          setProfileForm((f) => ({
                            ...f,
                            gender: e.target.value as Gender | "",
                          }))
                        }>
                        <option value="">Chọn giới tính</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                    <div className="user-modal__field">
                      <label>Địa chỉ</label>
                      <input
                        value={profileForm.address}
                        onChange={(e) =>
                          setProfileForm((f) => ({
                            ...f,
                            address: e.target.value,
                          }))
                        }
                        placeholder="TP.HCM"
                      />
                    </div>
                  </div>
                  <div className="user-modal__field">
                    <label>Ghi chú</label>
                    <textarea
                      value={profileForm.notes}
                      onChange={(e) =>
                        setProfileForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      placeholder="Ghi chú nội bộ..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {editModal.role === "STUDENT" && (
              <div className="user-modal__section">
                <h3>Học viên</h3>
                <div className="user-modal__field">
                  <label>Hạng bằng lái</label>
                  <select
                    value={profileLicenseTier}
                    onChange={(e) =>
                      setProfileLicenseTier(e.target.value as LicenseTier | "")
                    }>
                    <option value="">Chưa phân</option>
                    {LICENSE_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        Hạng {tier}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="user-modal__actions">
              <button
                className="user-modal__btn user-modal__btn--primary"
                onClick={handleEditSubmit}
                disabled={modalLoading || profileLoading}>
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
            <p className="user-modal__title">Đổi vai trò - {roleModal.fullName}</p>
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
            {roleValue === "STUDENT" && (
              <div className="user-modal__field">
                <label>Hạng bằng lái</label>
                <select
                  value={roleLicenseTier}
                  onChange={(e) =>
                    setRoleLicenseTier(e.target.value as LicenseTier | "")
                  }>
                  <option value="">Chưa phân</option>
                  {LICENSE_TIERS.map((tier) => (
                    <option key={tier} value={tier}>
                      Hạng {tier}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
