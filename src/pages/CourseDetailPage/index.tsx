import { useState } from "react";
import type { CourseResponse } from "@/types/course.types";
import { useCourseDetail } from "./hooks/useCourseDetail";
import { CourseBanner } from "./components/CourseBanner";
import { LessonsTab } from "./components/LessonsTab";
import { MaterialsTab } from "./components/MaterialsTab";
import { AddLessonModal } from "./components/AddLessonModal";
import { AddMaterialModal } from "./components/AddMaterialModal";
import "./CourseDetailPage.css";

type DetailTab = "lessons" | "materials";

export default function CourseDetailPage() {
  const {
    courseId,
    course,
    setCourse,
    loading,
    error,
    notice,
    actionError,
    canManageCourses,
    canArchiveCourses,
    activating,
    archiving,
    deletingLesson,
    handleActivate,
    handleArchive,
    handleDeleteLesson,
    goBack,
    goEdit,
  } = useCourseDetail();

  const [activeTab, setActiveTab] = useState<DetailTab>("lessons");
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  if (loading) {
    return (
      <div className="course-detail">
        <div className="course-detail-not-found">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail-not-found">
        <p>{error || "Không tìm thấy khóa học."}</p>
        <button onClick={goBack}>← Quay lại</button>
      </div>
    );
  }

  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);

  const handleCourseSaved = (next: CourseResponse) => {
    setCourse(next);
    setShowLessonModal(false);
    setShowMaterialModal(false);
  };

  return (
    <div className="course-detail">
      <div className="course-detail__header">
        <div className="course-detail__header-left">
          <button className="course-detail__back" onClick={goBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <h1>{course.title}</h1>
            <p>Chi tiết khóa học và lộ trình học tập</p>
          </div>
        </div>
        <div className="course-detail__header-actions">
          {canArchiveCourses && course.status === "DRAFT" && (
            <button
              className="course-detail__activate-btn"
              onClick={handleActivate}
              disabled={activating}
            >
              {activating ? "Đang kích hoạt..." : "Kích Hoạt"}
            </button>
          )}
          {canArchiveCourses && course.status === "ACTIVE" && (
            <button
              className="course-detail__archive-btn"
              onClick={handleArchive}
              disabled={archiving}
            >
              {archiving ? "Đang lưu trữ..." : "Lưu Trữ"}
            </button>
          )}
          {canManageCourses && (
            <button className="course-detail__edit-btn" onClick={goEdit}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Chỉnh Sửa
            </button>
          )}
        </div>
      </div>

      {notice && <div className="course-detail__notice">{notice}</div>}
      {actionError && <div className="course-detail__action-error">{actionError}</div>}

      <CourseBanner course={course} />

      <div className="course-detail__tabs">
        <button
          className={activeTab === "lessons" ? "course-detail__tab--active" : ""}
          onClick={() => setActiveTab("lessons")}
        >
          Lộ Trình Học
        </button>
        <button
          className={activeTab === "materials" ? "course-detail__tab--active" : ""}
          onClick={() => setActiveTab("materials")}
        >
          Tài Liệu
        </button>
      </div>

      {activeTab === "lessons" && (
        <LessonsTab
          lessons={sortedLessons}
          canManage={canManageCourses}
          deletingLesson={deletingLesson}
          onAdd={() => setShowLessonModal(true)}
          onDelete={handleDeleteLesson}
        />
      )}

      {activeTab === "materials" && (
        <MaterialsTab
          materials={course.materials}
          canManage={canManageCourses}
          onAdd={() => setShowMaterialModal(true)}
        />
      )}

      {showLessonModal && courseId && (
        <AddLessonModal
          courseId={courseId}
          initialOrder={course.lessons.length + 1}
          onClose={() => setShowLessonModal(false)}
          onSaved={handleCourseSaved}
        />
      )}

      {showMaterialModal && courseId && (
        <AddMaterialModal
          courseId={courseId}
          onClose={() => setShowMaterialModal(false)}
          onSaved={handleCourseSaved}
        />
      )}
    </div>
  );
}
