import type { ExamTemplateFormData } from "@/types/exam-template.types";
import type { ExamFormErrors } from "../hooks/useExamConfigForm";

interface ExamQuestionConfigSectionProps {
  form: ExamTemplateFormData;
  errors: ExamFormErrors;
  onUpdate: (patch: Partial<ExamTemplateFormData>) => void;
}

export function ExamQuestionConfigSection({
  form,
  errors,
  onUpdate,
}: ExamQuestionConfigSectionProps) {
  return (
    <div className="add-ec__section">
      <div className="add-ec__section-title">Cấu Hình Câu Hỏi</div>
      <div className="add-ec__form-body">
        <div className="add-ec__form-row">
          <div className="add-ec__form-group">
            <label>
              Tổng số câu hỏi <span className="add-ec__required">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={form.totalQuestions}
              onChange={(e) =>
                onUpdate({ totalQuestions: Number(e.target.value) })
              }
            />
            <span className="add-ec__hint">Số câu hỏi trong 1 đề thi</span>
            {errors.totalQuestions && (
              <span className="add-ec__hint" style={{ color: "#ef4444" }}>
                {errors.totalQuestions}
              </span>
            )}
          </div>
          <div className="add-ec__form-group">
            <label>
              Điểm chuẩn <span className="add-ec__required">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={form.passingScore}
              onChange={(e) =>
                onUpdate({ passingScore: Number(e.target.value) })
              }
            />
            <span className="add-ec__hint">Số câu đúng tối thiểu để đạt</span>
            {errors.passingScore && (
              <span className="add-ec__hint" style={{ color: "#ef4444" }}>
                {errors.passingScore}
              </span>
            )}
          </div>
        </div>

        <div className="add-ec__form-row">
          <div className="add-ec__form-group">
            <label>
              Câu điểm liệt <span className="add-ec__required">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={form.criticalQuestions}
              onChange={(e) =>
                onUpdate({ criticalQuestions: Number(e.target.value) })
              }
            />
            <span className="add-ec__hint">
              Số câu hỏi có tính điểm liệt trong đề
            </span>
            {errors.criticalQuestions && (
              <span className="add-ec__hint" style={{ color: "#ef4444" }}>
                {errors.criticalQuestions}
              </span>
            )}
          </div>
          <div className="add-ec__form-group">
            <label>
              Lỗi điểm liệt tối đa <span className="add-ec__required">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={form.maxCriticalMistakes}
              onChange={(e) =>
                onUpdate({ maxCriticalMistakes: Number(e.target.value) })
              }
            />
            <span className="add-ec__hint">
              Số câu điểm liệt sai tối đa để vẫn đạt (thường là 0)
            </span>
            {errors.maxCriticalMistakes && (
              <span className="add-ec__hint" style={{ color: "#ef4444" }}>
                {errors.maxCriticalMistakes}
              </span>
            )}
          </div>
        </div>

        <div className="add-ec__form-group">
          <label>
            <input
              type="checkbox"
              checked={form.shuffleQuestions}
              onChange={(e) => onUpdate({ shuffleQuestions: e.target.checked })}
              style={{ marginRight: 8 }}
            />
            Trộn câu hỏi ngẫu nhiên
          </label>
          <span className="add-ec__hint">
            Mỗi lần thi câu hỏi sẽ được sắp xếp ngẫu nhiên
          </span>
        </div>
      </div>
    </div>
  );
}
