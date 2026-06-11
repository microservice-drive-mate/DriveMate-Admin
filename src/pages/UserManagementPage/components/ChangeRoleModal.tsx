import { useEffect, useState } from "react";
import type { IdentityUser, UserRole } from "@/types/identity.types";
import type { LicenseTier } from "@/types/user-profile.types";
import { LICENSE_TIERS } from "@/types/user-profile.types";
import { identityService, userService } from "@/services";
import {
  getLicenseAssignmentErrorMessage,
  getLicenseAssignmentSuccessMessage,
  getPartialSaveErrorMessage,
  getUpdateAccountErrorMessage,
  getUpdateAccountSuccessMessage,
  SRS_MESSAGES,
} from "@/utils/srsMessages";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sau khi đổi role sang STUDENT, user-service tạo hồ sơ học viên bất đồng bộ
 * (qua sự kiện RabbitMQ). Poll cho tới khi `studentDetail` xuất hiện.
 */
async function waitForStudentProfile(id: string) {
  let last: Awaited<ReturnType<typeof userService.getById>> | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const result = await userService.getById(id);
    last = result;
    if (
      result.success &&
      result.data.role === "STUDENT" &&
      result.data.studentDetail
    ) {
      return result;
    }
    if (attempt < 4) await delay(300 * (attempt + 1));
  }
  return last;
}

interface ChangeRoleModalProps {
  user: IdentityUser;
  onClose: () => void;
  onSaved: (message: string) => void;
  onListChanged: () => void;
}

export function ChangeRoleModal({
  user,
  onClose,
  onSaved,
  onListChanged,
}: ChangeRoleModalProps) {
  const [roleValue, setRoleValue] = useState<UserRole>(user.role);
  const [roleLicenseTier, setRoleLicenseTier] = useState<LicenseTier | "">("");
  // STUDENT cần nạp hạng bằng hiện tại → bật loading ngay từ render đầu.
  const [modalLoading, setModalLoading] = useState(user.role === "STUDENT");
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (user.role !== "STUDENT") return;
    let active = true;
    userService.getById(user.userId).then((result) => {
      if (!active) return;
      if (result.success) {
        setRoleLicenseTier(result.data.studentDetail?.licenseTier ?? "");
      }
      setModalLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user.userId, user.role]);

  const handleSubmit = async () => {
    if (roleValue === "STUDENT" && !roleLicenseTier) {
      setModalError(SRS_MESSAGES.MSG20);
      return;
    }
    setModalLoading(true);
    setModalError(null);
    const result = await identityService.changeRole(user.userId, roleValue);
    if (!result.success) {
      setModalLoading(false);
      setModalError(getUpdateAccountErrorMessage(result));
      return;
    }

    if (roleValue === "STUDENT" && roleLicenseTier) {
      const profileResult = await waitForStudentProfile(user.userId);
      if (!profileResult?.success) {
        onListChanged();
        setModalLoading(false);
        setModalError(
          getPartialSaveErrorMessage(
            profileResult?.success === false
              ? getUpdateAccountErrorMessage(profileResult)
              : "Please try again later.",
          ),
        );
        return;
      }

      const licenseResult = await userService.assignLicenseTier(
        user.userId,
        roleLicenseTier,
      );
      if (!licenseResult.success) {
        onListChanged();
        setModalLoading(false);
        setModalError(
          getPartialSaveErrorMessage(
            getLicenseAssignmentErrorMessage(licenseResult),
          ),
        );
        return;
      }
    }

    setModalLoading(false);
    onSaved(
      roleValue === "STUDENT"
        ? `${getUpdateAccountSuccessMessage()} ${getLicenseAssignmentSuccessMessage()}`
        : getUpdateAccountSuccessMessage(),
    );
  };

  return (
    <div className="user-modal">
      <div className="user-modal__box">
        <p className="user-modal__title">Đổi vai trò - {user.fullName}</p>
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
            onClick={handleSubmit}
            disabled={modalLoading}>
            {modalLoading ? "Đang lưu..." : "Đổi Role"}
          </button>
          <button
            className="user-modal__btn"
            onClick={onClose}
            disabled={modalLoading}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
