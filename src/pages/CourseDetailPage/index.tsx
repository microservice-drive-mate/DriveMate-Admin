import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseService } from '@/services';
import { FileUploader } from '@/components/common/FileUploader';
import type { CourseResponse } from '../../types/course.types';
import { COURSE_STATUS_LABELS } from '../../types/course.types';
import { MaterialDownloadButton } from './components/MaterialDownloadButton';
import './CourseDetailPage.css';

type DetailTab = 'lessons' | 'materials';

function formatFee(fee: number) {
  return fee.toLocaleString('vi-VN') + 'đ';
}

interface LessonForm {
  title: string;
  order: number;
  content: string;
}

interface MaterialUpload {
  mediaFileId: string;
  publicUrl: string;
  originalName?: string;
  fileSize?: number;
  mimeType?: string;
}

interface MaterialForm {
  title: string;
  type: string;
  file: MaterialUpload | null;
}


export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<DetailTab>('lessons');
  const [activating, setActivating] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<string | null>(null);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState<LessonForm>({ title: '', order: 1, content: '' });
  const [lessonError, setLessonError] = useState('');
  const [savingLesson, setSavingLesson] = useState(false);

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState<MaterialForm>({ title: '', type: '', file: null });
  const [materialError, setMaterialError] = useState('');
  const [savingMaterial, setSavingMaterial] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    courseService.getById(courseId).then((res) => {
      if (res.success) setCourse(res.data);
      else setError(res.error);
      setLoading(false);
    });
  }, [courseId]);

  const handleActivate = async () => {
    if (!courseId) return;
    setActivating(true);
    const res = await courseService.activate(courseId);
    if (res.success) setCourse(res.data);
    setActivating(false);
  };

  const handleArchive = async () => {
    if (!courseId || !window.confirm('Lưu trữ khóa học này? Học sinh sẽ không thể đăng ký mới.')) return;
    setArchiving(true);
    const res = await courseService.archive(courseId);
    if (res.success) {
      setCourse((prev) => prev ? { ...prev, status: 'ARCHIVED' } : prev);
    }
    setArchiving(false);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!courseId || !window.confirm('Xác nhận xóa bài học này?')) return;
    setDeletingLesson(lessonId);
    const res = await courseService.deleteLesson(courseId, lessonId);
    if (res.success) setCourse(res.data);
    setDeletingLesson(null);
  };

  const openLessonModal = () => {
    const nextOrder = course ? course.lessons.length + 1 : 1;
    setLessonForm({ title: '', order: nextOrder, content: '' });
    setLessonError('');
    setShowLessonModal(true);
  };

  const handleSaveLesson = async () => {
    if (!courseId) return;
    if (!lessonForm.title.trim()) {
      setLessonError('Vui lòng nhập tiêu đề bài học');
      return;
    }
    if (!lessonForm.order || lessonForm.order < 1) {
      setLessonError('Thứ tự phải >= 1');
      return;
    }
    setSavingLesson(true);
    setLessonError('');
    const res = await courseService.addLesson(courseId, {
      title: lessonForm.title.trim(),
      order: lessonForm.order,
      content: lessonForm.content.trim() || undefined,
    });
    setSavingLesson(false);
    if (res.success) {
      setCourse(res.data);
      setShowLessonModal(false);
    } else {
      setLessonError(res.error);
    }
  };

  const openMaterialModal = () => {
    setMaterialForm({ title: '', type: '', file: null });
    setMaterialError('');
    setShowMaterialModal(true);
  };

  const handleSaveMaterial = async () => {
    if (!courseId) return;
    if (!materialForm.title.trim()) {
      setMaterialError('Vui lòng nhập tên tài liệu');
      return;
    }
    if (!materialForm.file) {
      setMaterialError('Vui lòng tải lên tệp tài liệu');
      return;
    }
    setSavingMaterial(true);
    setMaterialError('');
    const res = await courseService.addMaterial(courseId, {
      title: materialForm.title.trim(),
      fileUrl: materialForm.file.publicUrl,
      mediaFileId: materialForm.file.mediaFileId,
      type: materialForm.type.trim() || undefined,
    });
    setSavingMaterial(false);
    if (res.success) {
      setCourse(res.data);
      setShowMaterialModal(false);
    } else {
      setMaterialError(res.error);
    }
  };

  if (loading) {
    return <div className="course-detail"><div className="course-detail-not-found"><p>Đang tải...</p></div></div>;
  }

  if (error || !course) {
    return (
      <div className="course-detail-not-found">
        <p>{error || 'Không tìm thấy khóa học.'}</p>
        <button onClick={() => navigate('/courses')}>← Quay lại</button>
      </div>
    );
  }

  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="course-detail">
      <div className="course-detail__header">
        <div className="course-detail__header-left">
          <button className="course-detail__back" onClick={() => navigate('/courses')}>
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
          {course.status === 'DRAFT' && (
            <button
              className="course-detail__activate-btn"
              onClick={handleActivate}
              disabled={activating}
            >
              {activating ? 'Đang kích hoạt...' : 'Kích Hoạt'}
            </button>
          )}
          {course.status === 'ACTIVE' && (
            <button
              className="course-detail__archive-btn"
              onClick={handleArchive}
              disabled={archiving}
            >
              {archiving ? 'Đang lưu trữ...' : 'Lưu Trữ'}
            </button>
          )}
          <button
            className="course-detail__edit-btn"
            onClick={() => navigate(`/courses/${course.id}/edit`)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Chỉnh Sửa
          </button>
        </div>
      </div>

      <div className="course-detail__banner">
        <div className="course-detail__banner-left">
          <div className="course-detail__class-badge">{course.licenseCategory}</div>
          <span className={`course-detail__status-badge course-detail__status-badge--${course.status.toLowerCase()}`}>
            {COURSE_STATUS_LABELS[course.status]}
          </span>
        </div>
        <div className="course-detail__banner-right">
          {course.description && <p className="course-detail__desc">{course.description}</p>}
          <div className="course-detail__stats">
            <div className="course-detail__stat">
              <span className="course-detail__stat-icon">⏱</span>
              <div>
                <div className="course-detail__stat-label">Thời lượng</div>
                <div className="course-detail__stat-value">{course.duration ?? '—'}</div>
              </div>
            </div>
            <div className="course-detail__stat">
              <span className="course-detail__stat-icon">📖</span>
              <div>
                <div className="course-detail__stat-label">Bài học</div>
                <div className="course-detail__stat-value">{course.totalLessons}</div>
              </div>
            </div>
            <div className="course-detail__stat">
              <span className="course-detail__stat-icon">👥</span>
              <div>
                <div className="course-detail__stat-label">Sức chứa</div>
                <div className="course-detail__stat-value">{course.capacity ?? '—'}</div>
              </div>
            </div>
            <div className="course-detail__stat">
              <span className="course-detail__stat-icon">💰</span>
              <div>
                <div className="course-detail__stat-label">Học phí</div>
                <div className="course-detail__stat-value">{formatFee(course.tuitionFee)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="course-detail__tabs">
        <button
          className={activeTab === 'lessons' ? 'course-detail__tab--active' : ''}
          onClick={() => setActiveTab('lessons')}
        >
          Lộ Trình Học
        </button>
        <button
          className={activeTab === 'materials' ? 'course-detail__tab--active' : ''}
          onClick={() => setActiveTab('materials')}
        >
          Tài Liệu
        </button>
      </div>

      {activeTab === 'lessons' && (
        <div className="course-detail__section">
          <div className="course-detail__section-header course-detail__section-header--with-action">
            <span>Danh Sách Bài Học</span>
            <button className="course-detail__add-btn" onClick={openLessonModal}>
              + Thêm bài học
            </button>
          </div>
          {sortedLessons.length === 0 ? (
            <div className="course-detail__empty">Chưa có bài học nào.</div>
          ) : (
            <div className="course-detail__lesson-list">
              {sortedLessons.map((lesson) => (
                <div key={lesson.id} className="course-detail__lesson-row">
                  <div className="course-detail__lesson-num">{lesson.order}</div>
                  <div className="course-detail__lesson-info">
                    <div className="course-detail__lesson-title">{lesson.title}</div>
                    {lesson.content && (
                      <div className="course-detail__lesson-meta">
                        {lesson.content.slice(0, 100)}{lesson.content.length > 100 ? '...' : ''}
                      </div>
                    )}
                  </div>
                  <button
                    className="course-detail__lesson-delete"
                    onClick={() => handleDeleteLesson(lesson.id)}
                    disabled={deletingLesson === lesson.id}
                    title="Xóa bài học"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="course-detail__section">
          <div className="course-detail__section-header course-detail__section-header--with-action">
            <span>Tài Liệu Học Tập</span>
            <button className="course-detail__add-btn" onClick={openMaterialModal}>
              + Thêm tài liệu
            </button>
          </div>
          {course.materials.length === 0 ? (
            <div className="course-detail__empty">Chưa có tài liệu nào.</div>
          ) : (
            <div className="course-detail__material-list">
              {course.materials.map((material) => (
                <div key={material.id} className="course-detail__material-row">
                  <div className="course-detail__material-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <div className="course-detail__material-info">
                    <div className="course-detail__material-name">{material.title}</div>
                    {material.type && (
                      <span className="course-detail__material-type">{material.type}</span>
                    )}
                  </div>
                  <MaterialDownloadButton material={material} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showLessonModal && (
        <div className="course-detail__modal-overlay" onClick={() => !savingLesson && setShowLessonModal(false)}>
          <div className="course-detail__modal" onClick={(e) => e.stopPropagation()}>
            <div className="course-detail__modal-header">Thêm bài học mới</div>
            <div className="course-detail__modal-body">
              <div className="course-detail__form-group">
                <label>Tiêu đề *</label>
                <input
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="VD: Bài 1 - Luật giao thông"
                  disabled={savingLesson}
                />
              </div>
              <div className="course-detail__form-group">
                <label>Thứ tự *</label>
                <input
                  type="number"
                  min={1}
                  value={lessonForm.order}
                  onChange={(e) => setLessonForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  disabled={savingLesson}
                />
              </div>
              <div className="course-detail__form-group">
                <label>Nội dung</label>
                <textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))}
                  rows={4}
                  placeholder="Mô tả nội dung bài học..."
                  disabled={savingLesson}
                />
              </div>
              {lessonError && <div className="course-detail__form-error">{lessonError}</div>}
            </div>
            <div className="course-detail__modal-footer">
              <button
                className="course-detail__modal-cancel"
                onClick={() => setShowLessonModal(false)}
                disabled={savingLesson}
              >
                Hủy
              </button>
              <button
                className="course-detail__modal-save"
                onClick={handleSaveLesson}
                disabled={savingLesson}
              >
                {savingLesson ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMaterialModal && (
        <div className="course-detail__modal-overlay" onClick={() => !savingMaterial && setShowMaterialModal(false)}>
          <div className="course-detail__modal" onClick={(e) => e.stopPropagation()}>
            <div className="course-detail__modal-header">Thêm tài liệu mới</div>
            <div className="course-detail__modal-body">
              <div className="course-detail__form-group">
                <label>Tên tài liệu *</label>
                <input
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="VD: Giáo trình lý thuyết B2"
                  disabled={savingMaterial}
                />
              </div>
              <div className="course-detail__form-group">
                <label>Tệp tài liệu *</label>
                <FileUploader
                  value={materialForm.file}
                  onChange={(next) =>
                    setMaterialForm((f) => ({ ...f, file: next }))
                  }
                  disabled={savingMaterial}
                  label="Bấm hoặc kéo thả tệp vào đây"
                />
              </div>
              <div className="course-detail__form-group">
                <label>Loại tài liệu</label>
                <input
                  value={materialForm.type}
                  onChange={(e) => setMaterialForm((f) => ({ ...f, type: e.target.value }))}
                  placeholder="VD: PDF, video, slide"
                  disabled={savingMaterial}
                />
              </div>
              {materialError && <div className="course-detail__form-error">{materialError}</div>}
            </div>
            <div className="course-detail__modal-footer">
              <button
                className="course-detail__modal-cancel"
                onClick={() => setShowMaterialModal(false)}
                disabled={savingMaterial}
              >
                Hủy
              </button>
              <button
                className="course-detail__modal-save"
                onClick={handleSaveMaterial}
                disabled={savingMaterial}
              >
                {savingMaterial ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
