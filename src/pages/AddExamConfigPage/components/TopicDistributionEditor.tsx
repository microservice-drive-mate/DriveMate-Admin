import type { TopicDistributionItem } from "@/types/exam-template.types";
import type { TopicResponse } from "@/types/question.types";

interface TopicDistributionEditorProps {
  rows: TopicDistributionItem[];
  totalQuestions: number;
  total: number;
  topics: TopicResponse[];
  error?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdateRow: (index: number, patch: Partial<TopicDistributionItem>) => void;
}

export function TopicDistributionEditor({
  rows,
  totalQuestions,
  total,
  topics,
  error,
  onAdd,
  onRemove,
  onUpdateRow,
}: TopicDistributionEditorProps) {
  return (
    <div className="add-ec__section">
      <div className="add-ec__section-title">Phân Bổ Topic</div>
      <div className="add-ec__form-body">
        <span className="add-ec__hint" style={{ marginBottom: 12, display: "block" }}>
          Tuỳ chọn: xác định số câu lấy từ từng topic. Tổng số câu phải bằng {totalQuestions}.
          Nếu để trống, câu hỏi sẽ được lấy ngẫu nhiên từ toàn bộ ngân hàng.
        </span>

        {rows.map((row, index) => (
          <div key={index} className="add-ec__topic-row">
            <select
              value={row.topicId}
              onChange={(e) => onUpdateRow(index, { topicId: e.target.value })}
              style={{ flex: 1 }}
            >
              <option value="">Chọn topic</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={row.questionCount}
              onChange={(e) => onUpdateRow(index, { questionCount: Number(e.target.value) })}
              style={{ width: 80 }}
              placeholder="Số câu"
            />
            <button
              type="button"
              className="add-ec__topic-remove"
              onClick={() => onRemove(index)}
            >
              ×
            </button>
          </div>
        ))}

        {rows.length > 0 && (
          <div className="add-ec__topic-total">
            Tổng: <strong style={{ color: total === totalQuestions ? "#4ade80" : "#f87171" }}>
              {total}
            </strong> / {totalQuestions}
          </div>
        )}

        <button type="button" className="add-ec__topic-add" onClick={onAdd}>
          + Thêm topic
        </button>

        {error && (
          <span className="add-ec__hint" style={{ color: "#ef4444" }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
