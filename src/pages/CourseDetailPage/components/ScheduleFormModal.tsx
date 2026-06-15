import { useState } from "react";
import { courseService } from "@/services";
import type {
  CourseSchedule,
  CourseScheduleDayOfWeek,
} from "@/types/course.types";
import { DAY_OF_WEEK_LABELS } from "@/types/course.types";

interface Instructor {
  id: string;
  name: string;
}

interface ScheduleFormModalProps {
  courseId: string;
  instructors: Instructor[];
  schedule?: CourseSchedule;
  onClose: () => void;
  onSaved: (schedule: CourseSchedule) => void;
}

const DAY_OPTIONS: { value: CourseScheduleDayOfWeek; label: string }[] = [1, 2, 3, 4, 5, 6, 7].map(
  (d) => ({ value: d as CourseScheduleDayOfWeek, label: DAY_OF_WEEK_LABELS[d as CourseScheduleDayOfWeek] }),
);

interface FormState {
  instructorId: string;
  dayOfWeek: CourseScheduleDayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
}

export function ScheduleFormModal({ courseId, instructors, schedule, onClose, onSaved }: ScheduleFormModalProps) {
  const isEdit = !!schedule;

  const [form, setForm] = useState<FormState>(
    schedule
      ? {
          instructorId: schedule.instructorId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
          effectiveFrom: schedule.effectiveFrom,
          effectiveTo: schedule.effectiveTo ?? null,
          isActive: schedule.isActive,
        }
      : {
          instructorId: instructors[0]?.id ?? "",
          dayOfWeek: 2,
          startTime: "07:00",
          endTime: "09:00",
          room: "",
          effectiveFrom: "",
          effectiveTo: null,
          isActive: true,
        },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const validate = (): string => {
    if (!form.instructorId) return "Vui lòng chọn giảng viên";
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
      instructorId: form.instructorId,
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
            <label>Giảng viên *</label>
            <select
              value={form.instructorId}
              onChange={(e) => setForm((f) => ({ ...f, instructorId: e.target.value }))}
              disabled={saving}
            >
              {instructors.length === 0 && (
                <option value="">— Chưa có giảng viên nào —</option>
              )}
              {instructors.map((inst) => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>
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
