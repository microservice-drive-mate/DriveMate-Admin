import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_COURSES } from '../../data/courseData';
import type { Course, CourseFilters, CourseStatus } from '../../types/course.types';
import {
  COURSE_LICENSE_CLASSES,
  COURSE_STATUS_LABELS,
  COURSE_STATUS_OPTIONS,
} from '../../types/course.types';
import './CourseManagementPage.css';

const PAGE_SIZE = 6;

const STATUS_PILL: Record<CourseStatus, string> = {
  active: 'course-pill--active',
  draft: 'course-pill--draft',
  inactive: 'course-pill--inactive',
};

function formatFee(fee: number) {
  return fee.toLocaleString('vi-VN') + 'đ';
}

function SummaryCard({ title, value, accent }: { title: string; value: string; accent?: string }) {
  return (
    <div className="course-summary-card">
      <div className="course-summary-card__title">{title}</div>
      <div className="course-summary-card__value" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
    </div>
  );
}

function FilterBar({
  filters,
  onChange,
}: {
  filters: CourseFilters;
  onChange: (next: CourseFilters) => void;
}) {
  const update = (patch: Partial<CourseFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="course-filters">
      <div className="course-filters__search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Tìm kiếm khóa học..."
        />
      </div>

      <select value={filters.licenseClass} onChange={(e) => update({ licenseClass: e.target.value })}>
        <option value="">Tất cả hạng</option>
        {COURSE_LICENSE_CLASSES.map((cls) => (
          <option key={cls} value={cls}>{cls}</option>
        ))}
      </select>

      <select value={filters.status} onChange={(e) => update({ status: e.target.value })}>
        <option value="">Tất cả</option>
        {COURSE_STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <button
        className="course-filters__reset"
        onClick={() => onChange({ search: '', licenseClass: '', status: '' })}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M6 6V4h12v2M19 6l-1 14H6L5 6" />
        </svg>
        Đặt lại
      </button>
    </div>
  );
}

function CourseTable({
  courses,
  onView,
  onEdit,
}: {
  courses: Course[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  if (!courses.length) {
    return <div className="course-empty">Không tìm thấy khóa học nào.</div>;
  }

  return (
    <div className="course-table-wrap">
      <table className="course-table">
        <thead>
          <tr>
            <th>#</th>
            <th>
              Tên khóa học{' '}
              <span className="course-table__sort">⇅</span>
            </th>
            <th>
              Hạng bằng{' '}
              <span className="course-table__sort">⇅</span>
            </th>
            <th>
              Thời lượng{' '}
              <span className="course-table__sort">⇅</span>
            </th>
            <th>
              Bài học{' '}
              <span className="course-table__sort">⇅</span>
            </th>
            <th>
              Học viên{' '}
              <span className="course-table__sort">⇅</span>
            </th>
            <th>Học phí</th>
            <th>
              Trạng thái{' '}
              <span className="course-table__sort">⇅</span>
            </th>
            <th>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={course.id}>
              <td className="course-table__num">{index + 1}</td>
              <td className="course-table__name">{course.name}</td>
              <td>
                <span className="course-badge">{course.licenseClass}</span>
              </td>
              <td>{course.duration}</td>
              <td>
                <span className="course-table__icon-cell">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  {course.lessonCount}
                </span>
              </td>
              <td>
                <span className="course-table__icon-cell">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {course.studentCount.toLocaleString('vi-VN')}
                </span>
              </td>
              <td className="course-table__fee">{formatFee(course.tuitionFee)}</td>
              <td>
                <span className={`course-pill ${STATUS_PILL[course.status]}`}>
                  {COURSE_STATUS_LABELS[course.status]}
                </span>
              </td>
              <td>
                <div className="course-table__actions">
                  <button
                    className="course-btn-view"
                    onClick={() => onView(course.id)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Xem
                  </button>
                  <button
                    className="course-btn-edit"
                    onClick={() => onEdit(course.id)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Sửa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="course-pagination">
      <span className="course-pagination__info">
        Hiển thị {start}–{end} / {totalItems} khóa học
      </span>
      <div className="course-pagination__controls">
        <button disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>
          Trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={page === currentPage ? 'course-pagination__page--active' : ''}
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>
          Sau
        </button>
      </div>
    </div>
  );
}

export default function CourseManagementPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CourseFilters>({ search: '', licenseClass: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return MOCK_COURSES.filter((course) => {
      const matchSearch = !q || course.name.toLowerCase().includes(q);
      const matchClass = !filters.licenseClass || course.licenseClass === filters.licenseClass;
      const matchStatus = !filters.status || course.status === filters.status;
      return matchSearch && matchClass && matchStatus;
    });
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const totals = useMemo(
    () => ({
      total: MOCK_COURSES.length,
      active: MOCK_COURSES.filter((c) => c.status === 'active').length,
      students: MOCK_COURSES.reduce((sum, c) => sum + c.studentCount, 0),
      lessons: MOCK_COURSES.reduce((sum, c) => sum + c.lessonCount, 0),
    }),
    [],
  );

  const handleFilters = (next: CourseFilters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  return (
    <div className="course-management">
      <div className="course-management__header">
        <div>
          <h1>Quản Lý Khóa Học</h1>
          <p>Quản lý các khóa học lý thuyết lái xe</p>
        </div>
        <button className="course-management__add" onClick={() => navigate('/courses/new')}>
          + Thêm Khóa Học
        </button>
      </div>

      <div className="course-summary-grid">
        <SummaryCard title="Tổng khóa học" value={totals.total.toString()} />
        <SummaryCard title="Đang hoạt động" value={totals.active.toString()} accent="#4ade80" />
        <SummaryCard title="Tổng học viên" value={totals.students.toLocaleString('vi-VN')} />
        <SummaryCard title="Bài học" value={totals.lessons.toString()} />
      </div>

      <FilterBar filters={filters} onChange={handleFilters} />

      <CourseTable
        courses={paginated}
        onView={(id) => navigate(`/courses/${id}`)}
        onEdit={(id) => navigate(`/courses/${id}/edit`)}
      />

      <Pagination
        currentPage={pageSafe}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onChange={setCurrentPage}
      />
    </div>
  );
}
