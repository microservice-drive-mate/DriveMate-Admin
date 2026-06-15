import { useState, useCallback, useEffect } from "react";
import { courseService, userService } from "@/services";
import type { CourseSchedule } from "@/types/course.types";
import { DAY_OF_WEEK_LABELS } from "@/types/course.types";
import { ScheduleFormModal } from "./ScheduleFormModal";

interface Instructor {
  id: string;
  name: string;
}

interface SchedulesTabProps {
  courseId: string;
  instructorIds: string[];
  canManage: boolean;
}

export function SchedulesTab({ courseId, instructorIds, canManage }: SchedulesTabProps) {
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [instructorMap, setInstructorMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CourseSchedule | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await courseService.listSchedules(courseId);
    setLoading(false);
    if (res.success) {
      setSchedules(res.data as CourseSchedule[]);
    } else {
      setError(res.error);
    }
  }, [courseId]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    if (instructorIds.length === 0) return;
    Promise.all(instructorIds.map((id) => userService.getById(id))).then((results) => {
      const resolved: Instructor[] = [];
      const map: Record<string, string> = {};
      results.forEach((res, i) => {
        const name = res.success ? res.data?.fullName ?? instructorIds[i] : instructorIds[i];
        resolved.push({ id: instructorIds[i], name });
        map[instructorIds[i]] = name;
      });
      setInstructors(resolved);
      setInstructorMap(map);
    });
  }, [instructorIds]);

  const handleSaved = (saved: CourseSchedule) => {
    setSchedules((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    setShowModal(false);
    setEditingSchedule(null);
  };

  const handleDelete = async (schedule: CourseSchedule) => {
    if (!confirm(`Xóa lịch học ${DAY_OF_WEEK_LABELS[schedule.dayOfWeek]} ${schedule.startTime}–${schedule.endTime}?`)) return;
    setDeletingId(schedule.id);
    const res = await courseService.deleteSchedule(courseId, schedule.id);
    setDeletingId(null);
    if (res.success) {
      setSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
    } else {
      setError(res.error);
    }
  };

  const openAdd = () => {
    setEditingSchedule(null);
    setShowModal(true);
  };

  const openEdit = (schedule: CourseSchedule) => {
    setEditingSchedule(schedule);
    setShowModal(true);
  };

  if (loading) {
    return <div className="course-detail__section"><p className="course-detail__empty">Đang tải lịch học...</p></div>;
  }

  return (
    <div className="course-detail__section">
      <div className="course-detail__section-header course-detail__section-header--with-action">
        <span>Lịch Học</span>
        {canManage && (
          <button className="course-detail__add-btn" onClick={openAdd}>
            + Thêm lịch học
          </button>
        )}
      </div>

      {error && <div className="course-detail__action-error">{error}</div>}

      {schedules.length === 0 ? (
        <div className="course-detail__empty">Chưa có lịch học nào.</div>
      ) : (
        <div className="course-detail__schedule-table-wrap">
          <table className="course-detail__schedule-table">
            <thead>
              <tr>
                <th>Giảng viên</th>
                <th>Thứ</th>
                <th>Giờ</th>
                <th>Phòng</th>
                <th>Hiệu lực từ</th>
                <th>Đến</th>
                <th>Trạng thái</th>
                {canManage && <th></th>}
              </tr>
            </thead>
            <tbody>
              {schedules
                .slice()
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                .map((s) => (
                  <tr key={s.id}>
                    <td>{instructorMap[s.instructorId] ?? s.instructorId}</td>
                    <td>{DAY_OF_WEEK_LABELS[s.dayOfWeek]}</td>
                    <td>{s.startTime}–{s.endTime}</td>
                    <td>{s.room}</td>
                    <td>{s.effectiveFrom}</td>
                    <td>{s.effectiveTo ?? "—"}</td>
                    <td>
                      <span className={s.isActive ? "course-detail__badge--active" : "course-detail__badge--inactive"}>
                        {s.isActive ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </td>
                    {canManage && (
                      <td className="course-detail__schedule-actions">
                        <button
                          className="course-detail__schedule-edit"
                          onClick={() => openEdit(s)}
                          disabled={deletingId === s.id}
                          title="Chỉnh sửa"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="course-detail__lesson-delete"
                          onClick={() => handleDelete(s)}
                          disabled={deletingId === s.id}
                          title="Xóa lịch học"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ScheduleFormModal
          courseId={courseId}
          instructors={instructors}
          schedule={editingSchedule ?? undefined}
          onClose={() => { setShowModal(false); setEditingSchedule(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
