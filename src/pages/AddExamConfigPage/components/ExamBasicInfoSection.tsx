import type { ExamTemplateFormData } from "@/types/exam-template.types";
import { LICENSE_CATEGORIES } from "@/types/exam-template.types";
import type { ExamFormErrors } from "../hooks/useExamConfigForm";

interface ExamBasicInfoSectionProps {
  form: ExamTemplateFormData;
  isEdit: boolean;
  errors: ExamFormErrors;
  onUpdate: (patch: Partial<ExamTemplateFormData>) => void;
  onLicenseChange: (cls: string) => void;
}

export function ExamBasicInfoSection({
  form,
  isEdit,
  errors,
  onUpdate,
  onLicenseChange,
}: ExamBasicInfoSectionProps) {
  return (
    <div className="add-ec__section">
      <div className="add-ec__section-title">Thông Tin Cơ Bản</div>
      <div className="add-ec__form-body">
        <div className="add-ec__form-group">
          <label>
            Hạng bằng lái <span className="add-ec__required">*</span>
          </label>
          <select
            value={form.licenseCategory}
            onChange={(e) => onLicenseChange(e.target.value)}
            disabled={isEdit}>
            <option value="">Chọn hạng bằng</option>
            {LICENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {isEdit && (
            <span className="add-ec__hint">
              Không thể thay đổi hạng bằng sau khi tạo.
            </span>
          )}
          {errors.licenseCategory && (
            <span className="add-ec__hint" style={{ color: "#ef4444" }}>
              {errors.licenseCategory}
            </span>
          )}
        </div>

        <div className="add-ec__form-group">
          <label>
            Tên đề thi <span className="add-ec__required">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="VD: Đề thi B1 cơ bản"
          />
          {errors.name && (
            <span className="add-ec__hint" style={{ color: "#ef4444" }}>
              {errors.name}
            </span>
          )}
        </div>

        <div className="add-ec__form-group">
          <label>Mô tả</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Mô tả ngắn về đề thi (không bắt buộc)"
          />
        </div>
      </div>
    </div>
  );
}
