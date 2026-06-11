import { useState } from "react";
import { courseService } from "@/services";
import type { CourseResponse } from "@/types/course.types";

interface AddLessonModalProps {
  courseId: string;
  initialOrder: number;
  onClose: () => void;
  onSaved: (course: CourseResponse) => void;
}

export function AddLessonModal({
  courseId,
  initialOrder,
  onClose,
  onSaved,
}: AddLessonModalProps) {
  const [form, setForm] = useState({
    title: "",
    order: initialOrder,
    content: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Vui lòng nhập tiêu đề bài học");
      return;
    }
    if (!form.order || form.order < 1) {
      setError("Thứ tự phải >= 1");
      return;
    }
    setSaving(true);
    setError("");
    const res = await courseService.addLesson(courseId, {
      title: form.title.trim(),
      order: form.order,
      content: form.content.trim() || undefined,
    });
    setSaving(false);
    if (res.success) {
      onSaved(res.data);
    } else {
      setError(res.error);
    }
  };

  return (
    <div
      className="course-detail__modal-overlay"
      onClick={() => !saving && onClose()}>
      <div className="course-detail__modal" onClick={(e) => e.stopPropagation()}>
        <div className="course-detail__modal-header">Thêm bài học mới</div>
        <div className="course-detail__modal-body">
          <div className="course-detail__form-group">
            <label>Tiêu đề *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="VD: Bài 1 - Luật giao thông"
              disabled={saving}
            />
          </div>
          <div className="course-detail__form-group">
            <label>Thứ tự *</label>
            <input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
              disabled={saving}
            />
          </div>
          <div className="course-detail__form-group">
            <label>Nội dung</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={4}
              placeholder="Mô tả nội dung bài học..."
              disabled={saving}
            />
          </div>
          {error && <div className="course-detail__form-error">{error}</div>}
        </div>
        <div className="course-detail__modal-footer">
          <button
            className="course-detail__modal-cancel"
            onClick={onClose}
            disabled={saving}>
            Hủy
          </button>
          <button
            className="course-detail__modal-save"
            onClick={handleSave}
            disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
