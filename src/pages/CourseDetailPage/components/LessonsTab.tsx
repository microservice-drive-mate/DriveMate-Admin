import type { CourseResponse } from "@/types/course.types";

interface LessonsTabProps {
  lessons: CourseResponse["lessons"];
  canManage: boolean;
  deletingLesson: string | null;
  onAdd: () => void;
  onDelete: (lessonId: string) => void;
}

export function LessonsTab({
  lessons,
  canManage,
  deletingLesson,
  onAdd,
  onDelete,
}: LessonsTabProps) {
  return (
    <div className="course-detail__section">
      <div className="course-detail__section-header course-detail__section-header--with-action">
        <span>Danh Sách Bài Học</span>
        {canManage && (
          <button className="course-detail__add-btn" onClick={onAdd}>
            + Thêm bài học
          </button>
        )}
      </div>
      {lessons.length === 0 ? (
        <div className="course-detail__empty">Chưa có bài học nào.</div>
      ) : (
        <div className="course-detail__lesson-list">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="course-detail__lesson-row">
              <div className="course-detail__lesson-num">{lesson.order}</div>
              <div className="course-detail__lesson-info">
                <div className="course-detail__lesson-title">{lesson.title}</div>
                {lesson.content && (
                  <div className="course-detail__lesson-meta">
                    {lesson.content.slice(0, 100)}{lesson.content.length > 100 ? "..." : ""}
                  </div>
                )}
              </div>
              {canManage && (
                <button
                  className="course-detail__lesson-delete"
                  onClick={() => onDelete(lesson.id)}
                  disabled={deletingLesson === lesson.id}
                  title="Xóa bài học"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
