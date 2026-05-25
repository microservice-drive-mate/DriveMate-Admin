import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '@/services';
import type { CourseFilters, CourseResponse, CourseStatus, LicenseCategory } from '../../types/course.types';
import {
  COURSE_LICENSE_CATEGORIES,
  COURSE_STATUS_LABELS,
  COURSE_STATUS_OPTIONS,
} from '../../types/course.types';
import Pagination from '../../components/Pagination';
import { DEFAULT_PAGE_SIZE } from '../../constants/pagination';
import './CourseManagementPage.css';

const STATUS_PILL: Record<CourseStatus, string> = {
  ACTIVE: 'course-pill--active',
  DRAFT: 'course-pill--draft',
  ARCHIVED: 'course-pill--archived',
};

function formatFee(fee: number) {
  return fee.toLocaleString('vi-VN') + 'đ';
}

function SummaryCard({ title, value, accent }: { title: string; value: string | number; accent?: string }) {
  return (
    <div className="course-summary-card">
      <div className="course-summary-card__title">{title}</div>
      <div className="course-summary-card__value" style={accent ? { color: accent } : undefined}>
        {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
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

      <select value={filters.licenseCategory} onChange={(e) => update({ licenseCategory: e.target.value as LicenseCategory | '' })}>
        <option value="">Tất cả hạng</option>
        {COURSE_LICENSE_CATEGORIES.map((cls) => (
          <option key={cls} value={cls}>{cls}</option>
        ))}
      </select>

      <select value={filters.status} onChange={(e) => update({ status: e.target.value as CourseStatus | '' })}>
        <option value="">Tất cả</option>
        {COURSE_STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <button
        className="course-filters__reset"
        onClick={() => onChange({ search: '', licenseCategory: '', status: '' })}
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
  courses: CourseResponse[];
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
            <th>Tên khóa học</th>
            <th>Hạng bằng</th>
            <th>Thời lượng</th>
            <th>Bài học</th>
            <th>Học phí</th>
            <th>Trạng thái</th>
            <th>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={course.id}>
              <td className="course-table__num">{index + 1}</td>
              <td className="course-table__name">{course.title}</td>
              <td>
                <span className="course-badge">{course.licenseCategory}</span>
              </td>
              <td>{course.duration ?? '—'}</td>
              <td>
                <span className="course-table__icon-cell">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  {course.totalLessons}
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
                  <button className="course-btn-view" onClick={() => onView(course.id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Xem
                  </button>
                  <button className="course-btn-edit" onClick={() => onEdit(course.id)}>
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


export default function CourseManagementPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [filters, setFilters] = useState<CourseFilters>({ search: '', licenseCategory: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(async (page: number, f: CourseFilters) => {
    setLoading(true);
    setError('');
    const params = {
      page,
      size: DEFAULT_PAGE_SIZE,
      ...(f.licenseCategory ? { licenseCategory: f.licenseCategory } : {}),
      ...(f.status ? { status: f.status } : {}),
    };
    const result = await courseService.list(params);
    if (result.success) {
      setCourses(result.data.items);
      setTotal(result.data.total);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await courseService.list({ size: 1, status: 'ACTIVE' });
    if (res.success) setTotalActive(res.data.total);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchCourses(currentPage, filters);
  }, [currentPage, filters, fetchCourses]);

  const handleFilters = (next: CourseFilters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => c.title.toLowerCase().includes(q));
  }, [courses, filters.search]);

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

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
        <SummaryCard title="Tổng khóa học" value={total} />
        <SummaryCard title="Đang hoạt động" value={totalActive} accent="#4ade80" />
      </div>

      {error && <div className="course-error">{error}</div>}

      <FilterBar filters={filters} onChange={handleFilters} />

      {loading ? (
        <div className="course-empty">Đang tải...</div>
      ) : (
        <CourseTable
          courses={filtered}
          onView={(id) => navigate(`/courses/${id}`)}
          onEdit={(id) => navigate(`/courses/${id}/edit`)}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        pageSize={DEFAULT_PAGE_SIZE}
        label="khóa học"
        onChange={setCurrentPage}
      />
    </div>
  );
}
