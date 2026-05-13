import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { MOCK_COURSES } from '../../data/courseData';
import { COURSE_STATUS_LABELS } from '../../types/course.types';
import './CourseDetailPage.css';

type DetailTab = 'lessons' | 'materials' | 'exams';

const EXAM_TYPE_LABELS: Record<string, string> = {
  midterm: 'Bài thi giữa khóa',
  final: 'Bài thi cuối khóa',
  practice: 'Bài thi thử',
};

function formatFee(fee: number) {
  return fee.toLocaleString('vi-VN') + 'đ';
}

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DetailTab>('lessons');

  const course = MOCK_COURSES.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="course-detail-not-found">
        <p>Không tìm thấy khóa học.</p>
        <button onClick={() => navigate('/courses')}>← Quay lại</button>
      </div>
    );
  }

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
            <h1>{course.name}</h1>
            <p>Chi tiết khóa học và lộ trình học tập</p>
          </div>
        </div>
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

      {/* Banner */}
      <div className="course-detail__banner">
        <div className="course-detail__banner-left">
          <div className="course-detail__class-badge">{course.licenseClass}</div>
          <span className={`course-detail__status-badge course-detail__status-badge--${course.status}`}>
            {course.status === 'active' ? 'Đang hoạt động' : COURSE_STATUS_LABELS[course.status]}
          </span>
        </div>
        <div className="course-detail__banner-right">
          <p className="course-detail__desc">{course.description}</p>
          <div className="course-detail__stats">
            <div className="course-detail__stat">
              <span className="course-detail__stat-icon">⏱</span>
              <div>
                <div className="course-detail__stat-label">Thời lượng</div>
                <div className="course-detail__stat-value">{course.duration}</div>
              </div>
            </div>
            <div className="course-detail__stat">
              <span className="course-detail__stat-icon">👤</span>
              <div>
                <div className="course-detail__stat-label">Học viên</div>
                <div className="course-detail__stat-value">{course.studentCount.toLocaleString('vi-VN')}</div>
              </div>
            </div>
            <div className="course-detail__stat">
              <span className="course-detail__stat-icon">📖</span>
              <div>
                <div className="course-detail__stat-label">Bài học</div>
                <div className="course-detail__stat-value">{course.lessonCount}</div>
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

      {/* Tabs */}
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
        <button
          className={activeTab === 'exams' ? 'course-detail__tab--active' : ''}
          onClick={() => setActiveTab('exams')}
        >
          Bài Thi
        </button>
      </div>

      {/* Tab: Lộ Trình Học */}
      {activeTab === 'lessons' && (
        <div className="course-detail__section">
          <div className="course-detail__section-header">Danh Sách Bài Học</div>
          <div className="course-detail__lesson-list">
            {course.lessons.map((lesson, idx) => {
              const pct = course.studentCount > 0
                ? Math.round((lesson.completions / course.studentCount) * 100)
                : 0;
              return (
                <div key={lesson.id} className="course-detail__lesson-row">
                  <div className="course-detail__lesson-num">{idx + 1}</div>
                  <div className="course-detail__lesson-info">
                    <div className="course-detail__lesson-title">{lesson.title}</div>
                    <div className="course-detail__lesson-meta">
                      {lesson.duration} phút • {lesson.completions.toLocaleString('vi-VN')} học viên đã hoàn thành
                    </div>
                  </div>
                  <div className="course-detail__lesson-progress">
                    <ProgressBar percent={pct} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Tài Liệu */}
      {activeTab === 'materials' && (
        <div className="course-detail__section">
          <div className="course-detail__section-header">Tài Liệu Học Tập</div>
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
                  <div className="course-detail__material-name">{material.name}</div>
                  <div className="course-detail__material-meta">
                    {material.size} • {material.downloads} lượt tải
                  </div>
                </div>
                <button className="course-detail__download-btn">Tải xuống</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Bài Thi */}
      {activeTab === 'exams' && (
        <div className="course-detail__section">
          <div className="course-detail__section-header">Bài Thi Trong Khóa</div>
          <div className="course-detail__exam-grid">
            {course.exams.map((exam) => (
              <div key={exam.id} className="course-detail__exam-card">
                <div className="course-detail__exam-title">{EXAM_TYPE_LABELS[exam.type] ?? exam.type}</div>
                <div className="course-detail__exam-rows">
                  <div className="course-detail__exam-row">
                    <span>Số câu hỏi:</span>
                    <span>{exam.totalQuestions}</span>
                  </div>
                  <div className="course-detail__exam-row">
                    <span>Thời gian:</span>
                    <strong>{exam.duration} phút</strong>
                  </div>
                  <div className="course-detail__exam-row">
                    <span>Điểm yêu cầu tối thiểu:</span>
                    <span className="course-detail__exam-score">
                      {exam.minScore}/{exam.totalQuestions}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
