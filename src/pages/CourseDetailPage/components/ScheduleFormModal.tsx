import { useState } from "react";
import { courseService } from "@/services";
import type {
  CourseSchedule,
  CourseScheduleDayOfWeek,
  CreateSchedulePayload,
} from "@/types/course.types";
import { DAY_OF_WEEK_LABELS } from "@/types/course.types";

interface ScheduleFormModalProps {
  courseId: string;
  schedule?: CourseSchedule;
  onClose: () => void;
  onSaved: (schedule: CourseSchedule) => void;
}

const DAY_OPTIONS: { value: CourseScheduleDayOfWeek; label: string }[] = [1, 2, 3, 4, 5, 6, 7].map(
  (d) => ({ value: d as CourseScheduleDayOfWeek, label: DAY_OF_WEEK_LABELS[d as CourseScheduleDayOfWeek] }),
);

const defaultForm: CreateSchedulePayload & { isActive: boolean } = {
  dayOfWeek: 2,
  startTime: "07:00",
  endTime: "09:00",
  room: "",
  effectiveFrom: "",
  effectiveTo: null,
  isActive: true,
};

export function ScheduleFormModal({ courseId, schedule, onClose, onSaved }: ScheduleFormModalProps) {
  const isEdit = !!schedule;

  const [form, setForm] = useState<CreateSchedulePayload & { isActive: boolean }>(
    schedule
      ? {
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
          effectiveFrom: schedule.effectiveFrom,
          effectiveTo: schedule.effectiveTo ?? null,
          isActive: schedule.isActive,
        }
      : defaultForm,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const validate = (): string => {
    if (!form.room.trim()) return "Vui lòng nhập phòng học";
    if (!form.effectiveFrom) return "Vui lòng chọn ngày bắt đầu hiệu lực";
    if (form.startTime >= form.endTime) return "Giờ kết thúc phải sau giờ bắt đầu";
    if (form.effectiveTo && form.effectiveTo <= form.effectiveFrom)
      return "Ngày kết thúc hiệu lực phải sau ngày bắt đầu";
    return "";
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
      room: form.room.trim(),
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo || null,
      isActive: form.isActive,
    };

    const res = isEdit
      ? await courseService.updateSchedule(courseId, schedule!.id, payload)
      : await courseService.createSchedule(courseId, payload);

    setSaving(false);
    if (res.success) {
      onSaved(res.data as CourseSchedule);
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="course-detail__modal-overlay" onClick={() => !saving && onClose()}>
      <div className="course-detail__modal" onClick={(e) => e.stopPropagation()}>
        <div className="course-detail__modal-header">
          {isEdit ? "Chỉnh sửa lịch học" : "Thêm lịch học mới"}
        </div>
        <div className="course-detail__modal-body">
          <div className="course-detail__form-group">
            <label>Thứ *</label>
            <select
              value={form.dayOfWeek}
              onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) as CourseScheduleDayOfWeek }))}
              disabled={saving}
            >
              {DAY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="course-detail__form-row">
            <div className="course-detail__form-group">
              <label>Giờ bắt đầu *</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="course-detail__form-group">
              <label>Giờ kết thúc *</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>
          <div className="course-detail__form-group">
            <label>Phòng học *</label>
            <input
              value={form.room}
              onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
              placeholder="VD: Phòng A1, Sân tập B2..."
              disabled={saving}
            />
          </div>
          <div className="course-detail__form-row">
            <div className="course-detail__form-group">
              <label>Hiệu lực từ *</label>
              <input
                type="date"
                value={form.effectiveFrom}
                onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="course-detail__form-group">
              <label>Đến (tùy chọn)</label>
              <input
                type="date"
                value={form.effectiveTo ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, effectiveTo: e.target.value || null }))}
                disabled={saving}
              />
            </div>
          </div>
          <div className="course-detail__form-group course-detail__form-group--checkbox">
            <label>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                disabled={saving}
              />
              Đang hoạt động
            </label>
          </div>
          {error && <div className="course-detail__form-error">{error}</div>}
        </div>
        <div className="course-detail__modal-footer">
          <button className="course-detail__modal-cancel" onClick={onClose} disabled={saving}>
            Hủy
          </button>
          <button className="course-detail__modal-save" onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
