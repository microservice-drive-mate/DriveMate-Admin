import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncData } from '@/hooks/useAsyncData';
import { courseService } from '@/services';
import type { CourseFilters, CourseResponse } from '../../types/course.types';
import Pagination from '../../components/Pagination';
import { DEFAULT_PAGE_SIZE } from '../../constants/pagination';
import { CourseTable } from './components/CourseTable';
import { FilterBar } from './components/FilterBar';
import { SummaryCard } from './components/SummaryCard';
import './CourseManagementPage.css';

const EMPTY_COURSE_PAGE = {
  items: [] as CourseResponse[],
  total: 0,
  page: 1,
  size: DEFAULT_PAGE_SIZE,
};

export default function CourseManagementPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CourseFilters>({ search: '', licenseCategory: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const courseParams = useMemo(
    () => ({
      page: currentPage,
      size: DEFAULT_PAGE_SIZE,
      ...(filters.licenseCategory ? { licenseCategory: filters.licenseCategory } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    }),
    [currentPage, filters.licenseCategory, filters.status],
  );

  const loadCourses = useCallback(
    () => courseService.list(courseParams),
    [courseParams],
  );
  const coursesQuery = useAsyncData(loadCourses, {
    initialData: EMPTY_COURSE_PAGE,
    retainPreviousData: false,
  });

  const loadActiveTotal = useCallback(async () => {
    const res = await courseService.list({ size: 1, status: 'ACTIVE' });
    if (!res.success) return res;
    return { success: true as const, data: res.data.total };
  }, []);
  const activeTotalQuery = useAsyncData(loadActiveTotal, { initialData: 0 });

  const handleFilters = (next: CourseFilters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const courses = coursesQuery.data.items;
  const total = coursesQuery.data.total;
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
          <h1>Quáº£n LÃ½ KhÃ³a Há»c</h1>
          <p>Quáº£n lÃ½ cÃ¡c khÃ³a há»c lÃ½ thuyáº¿t lÃ¡i xe</p>
        </div>
        <button className="course-management__add" onClick={() => navigate('/courses/new')}>
          + ThÃªm KhÃ³a Há»c
        </button>
      </div>

      <div className="course-summary-grid">
        <SummaryCard title="Tá»•ng khÃ³a há»c" value={total} />
        <SummaryCard title="Äang hoáº¡t Ä‘á»™ng" value={activeTotalQuery.data} accent="#4ade80" />
      </div>

      {coursesQuery.error && <div className="course-error">{coursesQuery.error}</div>}

      <FilterBar filters={filters} onChange={handleFilters} />

      {coursesQuery.loading ? (
        <div className="course-empty">Äang táº£i...</div>
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
        label="khÃ³a há»c"
        onChange={setCurrentPage}
      />
    </div>
  );
}
