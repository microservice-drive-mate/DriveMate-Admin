import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_COURSES, MOCK_INSTRUCTORS } from '../../data/courseData';
import type { CourseFormData } from '../../types/course.types';
import { COURSE_LICENSE_CLASSES, COURSE_STATUS_OPTIONS } from '../../types/course.types';
import './AddCoursePage.css';

type FormTab = 'basic' | 'content' | 'requirements';

const DEFAULT_FORM: CourseFormData = {
  name: '',
  licenseClass: '',
  duration: '',
  tuitionFee: 5000000,
  capacity: 30,
  description: '',
  status: '',
  instructors: [],
  lessons: [{ title: '' }, { title: '' }, { title: '' }, { title: '' }, { title: '' }],
  materials: [],
  minAge: 18,
  prerequisite: '',
  attendanceRate: 80,
  minPassScore: 80,
  requiredExams: 3,
};

export default function AddCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(courseId);

  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [form, setForm] = useState<CourseFormData>(DEFAULT_FORM);
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);

  useEffect(() => {
    if (isEdit && courseId) {
      const course = MOCK_COURSES.find((c) => c.id === courseId);
      if (course) {
        setForm({
          name: course.name,
          licenseClass: course.licenseClass,
          duration: course.duration,
          tuitionFee: course.tuitionFee,
          capacity: course.capacity,
          description: course.description,
          status: course.status,
          instructors: [...course.instructors],
          lessons: course.lessons.map((l) => ({ title: l.title })),
          materials: course.materials.map((m) => ({ name: m.name, url: '' })),
          minAge: course.minAge,
          prerequisite: course.prerequisite,
          attendanceRate: course.attendanceRate,
          minPassScore: course.minPassScore,
          requiredExams: course.requiredExams,
        });
      }
    }
  }, [isEdit, courseId]);

  const updateForm = (patch: Partial<CourseFormData>) => setForm((f) => ({ ...f, ...patch }));

  const addLesson = () => updateForm({ lessons: [...form.lessons, { title: '' }] });
  const removeLesson = (idx: number) =>
    updateForm({ lessons: form.lessons.filter((_, i) => i !== idx) });
  const updateLesson = (idx: number, title: string) =>
    updateForm({ lessons: form.lessons.map((l, i) => (i === idx ? { title } : l)) });

  const addMaterial = () => updateForm({ materials: [...form.materials, { name: '', url: '' }] });
  const removeMaterial = (idx: number) =>
    updateForm({ materials: form.materials.filter((_, i) => i !== idx) });
  const updateMaterial = (idx: number, field: 'name' | 'url', value: string) =>
    updateForm({
      materials: form.materials.map((m, i) =>
        i === idx ? { ...m, [field]: value } : m,
      ),
    });

  const toggleInstructor = (name: string) => {
    const current = form.instructors;
    if (current.includes(name)) {
      updateForm({ instructors: current.filter((i) => i !== name) });
    } else {
      updateForm({ instructors: [...current, name] });
    }
  };

  const removeInstructor = (name: string) =>
    updateForm({ instructors: form.instructors.filter((i) => i !== name) });

  return (
    <div className="add-course">
      <div className="add-course__header">
        <div className="add-course__header-left">
          <button className="add-course__back" onClick={() => navigate('/courses')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <h1>{isEdit ? 'Chỉnh Sửa Khóa Học' : 'Thêm Khóa Học Mới'}</h1>
            <p>{isEdit ? 'Cập nhật thông tin khóa học' : 'Tạo khóa học mới cho hệ thống'}</p>
          </div>
        </div>
      </div>

      <div className="add-course__body">
        {/* Main content */}
        <div className="add-course__main">
          {/* Tab nav */}
          <div className="add-course__tabs">
            {[
              { key: 'basic', label: 'Thông Tin Cơ Bản' },
              { key: 'content', label: 'Nội Dung' },
              { key: 'requirements', label: 'Yêu Cầu' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={activeTab === key ? 'add-course__tab--active' : ''}
                onClick={() => setActiveTab(key as FormTab)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Thông Tin Cơ Bản */}
          {activeTab === 'basic' && (
            <div className="add-course__section">
              <div className="add-course__section-title">Thông Tin Chung</div>
              <div className="add-course__form-body">
                <div className="add-course__form-group">
                  <label>Tên khóa học</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                    placeholder="VD: Khóa học B1 – Cơ bản"
                  />
                </div>

                <div className="add-course__form-row">
                  <div className="add-course__form-group">
                    <label>Hạng bằng</label>
                    <select
                      value={form.licenseClass}
                      onChange={(e) => updateForm({ licenseClass: e.target.value })}
                    >
                      <option value="">Chọn hạng</option>
                      {COURSE_LICENSE_CLASSES.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div className="add-course__form-group">
                    <label>Thời lượng</label>
                    <input
                      value={form.duration}
                      onChange={(e) => updateForm({ duration: e.target.value })}
                      placeholder="VD: 3 tháng"
                    />
                  </div>
                </div>

                <div className="add-course__form-row">
                  <div className="add-course__form-group">
                    <label>Học phí</label>
                    <input
                      type="number"
                      value={form.tuitionFee}
                      onChange={(e) => updateForm({ tuitionFee: Number(e.target.value) })}
                      placeholder="5000000"
                    />
                  </div>
                  <div className="add-course__form-group">
                    <label>Sức chứa lớp</label>
                    <input
                      type="number"
                      value={form.capacity}
                      onChange={(e) => updateForm({ capacity: Number(e.target.value) })}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="add-course__form-group">
                  <label>Mô tả khóa học</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm({ description: e.target.value })}
                    placeholder="Nhập mô tả chi tiết về khóa học..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Nội Dung */}
          {activeTab === 'content' && (
            <>
              <div className="add-course__section">
                <div className="add-course__section-header-row">
                  <div className="add-course__section-title">Danh Sách Bài Học</div>
                  <button className="add-course__add-item-btn" onClick={addLesson}>
                    + Thêm Bài
                  </button>
                </div>
                <div className="add-course__lesson-list">
                  {form.lessons.map((lesson, idx) => (
                    <div key={idx} className="add-course__lesson-row">
                      <div className="add-course__lesson-num">{idx + 1}</div>
                      <input
                        value={lesson.title}
                        onChange={(e) => updateLesson(idx, e.target.value)}
                        placeholder={`Tên bài học ${idx + 1}`}
                      />
                      <button
                        className="add-course__remove-btn"
                        onClick={() => removeLesson(idx)}
                        title="Xóa bài học"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="add-course__section">
                <div className="add-course__section-header-row">
                  <div className="add-course__section-title">Tài Liệu Học Tập</div>
                  <button className="add-course__add-item-btn" onClick={addMaterial}>
                    + Thêm Tài Liệu
                  </button>
                </div>
                {form.materials.length === 0 ? (
                  <div className="add-course__empty">Chưa có tài liệu nào</div>
                ) : (
                  <div className="add-course__material-list">
                    {form.materials.map((mat, idx) => (
                      <div key={idx} className="add-course__material-row">
                        <input
                          value={mat.name}
                          onChange={(e) => updateMaterial(idx, 'name', e.target.value)}
                          placeholder="Tên tài liệu"
                        />
                        <input
                          value={mat.url}
                          onChange={(e) => updateMaterial(idx, 'url', e.target.value)}
                          placeholder="URL tài liệu"
                        />
                        <button
                          className="add-course__remove-btn"
                          onClick={() => removeMaterial(idx)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tab: Yêu Cầu */}
          {activeTab === 'requirements' && (
            <>
              <div className="add-course__section">
                <div className="add-course__section-title">Yêu Cầu Học Viên</div>
                <div className="add-course__form-body">
                  <div className="add-course__form-group">
                    <label>Độ tuổi tối thiểu</label>
                    <input
                      type="number"
                      value={form.minAge}
                      onChange={(e) => updateForm({ minAge: Number(e.target.value) })}
                      placeholder="18"
                    />
                  </div>
                  <div className="add-course__form-group">
                    <label>Điều kiện tiên quyết</label>
                    <textarea
                      value={form.prerequisite}
                      onChange={(e) => updateForm({ prerequisite: e.target.value })}
                      placeholder="VD: Đã có GPLX hạng A1..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="add-course__section">
                <div className="add-course__section-title">Yêu Cầu Hoàn Thành</div>
                <div className="add-course__form-body">
                  <div className="add-course__form-row">
                    <div className="add-course__form-group">
                      <label>Tỷ lệ tham dự (%)</label>
                      <input
                        type="number"
                        value={form.attendanceRate}
                        onChange={(e) => updateForm({ attendanceRate: Number(e.target.value) })}
                        placeholder="80"
                      />
                    </div>
                    <div className="add-course__form-group">
                      <label>Điểm đạt tối thiểu</label>
                      <input
                        type="number"
                        value={form.minPassScore}
                        onChange={(e) => updateForm({ minPassScore: Number(e.target.value) })}
                        placeholder="80"
                      />
                    </div>
                  </div>
                  <div className="add-course__form-group">
                    <label>Số bài thi bắt buộc</label>
                    <input
                      type="number"
                      value={form.requiredExams}
                      onChange={(e) => updateForm({ requiredExams: Number(e.target.value) })}
                      placeholder="3"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="add-course__sidebar">
          {/* Status */}
          <div className="add-course__sidebar-card">
            <div className="add-course__sidebar-title">Trạng Thái</div>
            <label className="add-course__sidebar-label">Trạng thái khóa học</label>
            <select
              value={form.status}
              onChange={(e) => updateForm({ status: e.target.value })}
            >
              <option value="">Chọn trạng thái</option>
              {COURSE_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Instructors */}
          <div className="add-course__sidebar-card">
            <div className="add-course__sidebar-title">Giảng Viên</div>
            <p className="add-course__sidebar-desc">Chọn một hoặc nhiều giảng viên phụ trách</p>

            {form.instructors.length > 0 && (
              <div className="add-course__instructor-tags">
                {form.instructors.map((name) => (
                  <span key={name} className="add-course__instructor-tag">
                    {name}
                    <button onClick={() => removeInstructor(name)}>×</button>
                  </span>
                ))}
              </div>
            )}

            <div className="add-course__instructor-select">
              <button
                className="add-course__instructor-toggle"
                onClick={() => setShowInstructorDropdown((v) => !v)}
              >
                {form.instructors.length > 0
                  ? `${form.instructors.length} giảng viên đã chọn`
                  : 'Chọn giảng viên'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={showInstructorDropdown ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
                </svg>
              </button>
              {showInstructorDropdown && (
                <div className="add-course__instructor-dropdown">
                  {MOCK_INSTRUCTORS.map((name) => (
                    <label key={name} className="add-course__instructor-option">
                      <input
                        type="checkbox"
                        checked={form.instructors.includes(name)}
                        onChange={() => toggleInstructor(name)}
                      />
                      {name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <button className="add-course__submit-btn" onClick={() => navigate('/courses')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {isEdit ? 'Lưu Thay Đổi' : 'Tạo Mới'}
          </button>
          <button className="add-course__cancel-btn" onClick={() => navigate('/courses')}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
