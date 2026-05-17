import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionService, topicService } from '@/services';
import type { QuestionResponse, QuestionFilters, QuestionDifficulty, TopicResponse } from '../../types/question.types';
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  LICENSE_CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
} from '../../types/question.types';
import './index.css';

const PAGE_SIZE = 10;

const DIFFICULTY_CLASS: Record<QuestionDifficulty, string> = {
  EASY: 'q-badge--easy',
  MEDIUM: 'q-badge--medium',
  HARD: 'q-badge--hard',
};

const DEFAULT_FILTERS: QuestionFilters = {
  keyword: '',
  licenseCategory: '',
  type: '',
  difficulty: '',
  topicId: '',
  includeDeleted: false,
};

function SummaryCard({ title, value, accent }: { title: string; value: string | number; accent?: string }) {
  return (
    <div className="q-summary-card">
      <div className="q-summary-card__title">{title}</div>
      <div className="q-summary-card__value" style={accent ? { color: accent } : undefined}>
        {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
      </div>
    </div>
  );
}

function FilterBar({
  filters,
  topics,
  onChange,
}: {
  filters: QuestionFilters;
  topics: TopicResponse[];
  onChange: (next: QuestionFilters) => void;
}) {
  const update = (patch: Partial<QuestionFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="q-filters">
      <div className="q-filters__search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={filters.keyword}
          onChange={(e) => update({ keyword: e.target.value })}
          placeholder="Tìm kiếm câu hỏi..."
        />
      </div>

      <select value={filters.licenseCategory} onChange={(e) => update({ licenseCategory: e.target.value as QuestionFilters['licenseCategory'] })}>
        <option value="">Hạng bằng</option>
        {LICENSE_CATEGORY_OPTIONS.map((cls) => (
          <option key={cls} value={cls}>{cls}</option>
        ))}
      </select>

      <select value={filters.type} onChange={(e) => update({ type: e.target.value as QuestionFilters['type'] })}>
        <option value="">Loại câu hỏi</option>
        {QUESTION_TYPE_OPTIONS.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <select value={filters.topicId} onChange={(e) => update({ topicId: e.target.value })}>
        <option value="">Chủ đề</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <select value={filters.difficulty} onChange={(e) => update({ difficulty: e.target.value as QuestionFilters['difficulty'] })}>
        <option value="">Độ khó</option>
        {DIFFICULTY_OPTIONS.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>

      <label className="q-filters__deleted-toggle">
        <input
          type="checkbox"
          checked={filters.includeDeleted}
          onChange={(e) => update({ includeDeleted: e.target.checked })}
        />
        <span>Hiện đã xóa</span>
      </label>
    </div>
  );
}

function ActionMenu({
  question,
  onEdit,
  onDelete,
}: {
  question: QuestionResponse;
  onEdit: (id: string) => void;
  onDelete: (id: string, version: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="q-action-menu" ref={ref}>
      <button className="q-action-menu__trigger" onClick={() => setOpen((v) => !v)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="q-action-menu__dropdown">
          {!question.isDeleted && (
            <button onClick={() => { onEdit(question.id); setOpen(false); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Chỉnh sửa
            </button>
          )}
          {!question.isDeleted && (
            <button
              className="q-action-menu__item--danger"
              onClick={() => { onDelete(question.id, question.version); setOpen(false); }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
              Xóa
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionTable({
  questions,
  topics,
  loading,
  onEdit,
  onDelete,
}: {
  questions: QuestionResponse[];
  topics: TopicResponse[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, version: number) => void;
}) {
  const topicMap = Object.fromEntries(topics.map((t) => [t.id, t.name]));

  if (loading) return <div className="q-empty">Đang tải...</div>;
  if (!questions.length) return <div className="q-empty">Không tìm thấy câu hỏi nào.</div>;

  return (
    <div className="q-table-wrap">
      <table className="q-table">
        <thead>
          <tr>
            <th>Nội Dung</th>
            <th>Loại</th>
            <th>Hạng</th>
            <th>Chủ Đề</th>
            <th>Độ Khó</th>
            <th>Trạng thái</th>
            <th>Version</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.id} className={q.isDeleted ? 'q-table__row--deleted' : ''}>
              <td className="q-table__content">
                <span title={q.content}>{q.content}</span>
                {q.isCritical && <span className="q-type-badge q-type-badge--critical">Liệt</span>}
              </td>
              <td>
                <span className="q-type-badge">{QUESTION_TYPE_LABELS[q.type]}</span>
              </td>
              <td>
                <div className="q-class-list">
                  {q.licenseCategories.map((c) => (
                    <span key={c} className="q-class-badge">{c}</span>
                  ))}
                </div>
              </td>
              <td className="q-table__topic">{topicMap[q.topicId] ?? q.topicId}</td>
              <td>
                <span className={`q-badge ${DIFFICULTY_CLASS[q.difficulty]}`}>
                  {DIFFICULTY_LABELS[q.difficulty]}
                </span>
              </td>
              <td>
                {q.isDeleted ? (
                  <span className="q-status q-status--deleted">Đã xóa</span>
                ) : q.isActive ? (
                  <span className="q-status q-status--active">Hoạt động</span>
                ) : (
                  <span className="q-status q-status--inactive">Tạm dừng</span>
                )}
              </td>
              <td>v{q.version}</td>
              <td>
                <ActionMenu question={q} onEdit={onEdit} onDelete={onDelete} />
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
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1);

  return (
    <div className="q-pagination">
      <span className="q-pagination__info">
        Hiển thị {start}–{end} / {totalItems} câu hỏi
      </span>
      <div className="q-pagination__controls">
        <button disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>Trước</button>
        {pages.map((page) => (
          <button
            key={page}
            className={page === currentPage ? 'q-pagination__page--active' : ''}
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>Sau</button>
      </div>
    </div>
  );
}

export default function QuestionManagementPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalCritical, setTotalCritical] = useState(0);
  const [filters, setFilters] = useState<QuestionFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchQuestions = useCallback(async (page: number, f: QuestionFilters) => {
    setLoading(true);
    setError('');
    const params = {
      page,
      size: PAGE_SIZE,
      ...(f.keyword ? { keyword: f.keyword } : {}),
      ...(f.licenseCategory ? { licenseCategory: f.licenseCategory } : {}),
      ...(f.type ? { type: f.type } : {}),
      ...(f.difficulty ? { difficulty: f.difficulty } : {}),
      ...(f.topicId ? { topicId: f.topicId } : {}),
      ...(f.includeDeleted ? { includeDeleted: true } : {}),
    };
    const result = await questionService.list(params);
    if (result.success) {
      setQuestions(result.data.items);
      setTotal(result.data.total);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  const fetchTopics = useCallback(async () => {
    const result = await topicService.list({ size: 100 });
    if (result.success) setTopics(result.data.items);
  }, []);

  const fetchStats = useCallback(async () => {
    const [activeRes, criticalRes] = await Promise.all([
      questionService.list({ size: 1, isActive: true }),
      questionService.list({ size: 1, isCritical: true }),
    ]);
    if (activeRes.success) setTotalActive(activeRes.data.total);
    if (criticalRes.success) setTotalCritical(criticalRes.data.total);
  }, []);

  useEffect(() => {
    fetchTopics();
    fetchStats();
  }, [fetchTopics, fetchStats]);

  useEffect(() => {
    fetchQuestions(currentPage, filters);
  }, [currentPage, filters, fetchQuestions]);

  const handleFilters = (next: QuestionFilters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string, version: number) => {
    if (!window.confirm('Xác nhận xóa câu hỏi này?')) return;
    const result = await questionService.delete(id, version);
    if (result.success) {
      fetchQuestions(currentPage, filters);
      fetchStats();
    } else {
      alert(result.error);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="q-management">
      <div className="q-management__header">
        <div>
          <h1>Ngân Hàng Câu Hỏi</h1>
          <p>Quản lý câu hỏi thi lý thuyết và lịch sử chỉnh sửa</p>
        </div>
        <button className="q-management__add" onClick={() => navigate('/questions/new')}>
          + Thêm Câu Hỏi
        </button>
      </div>

      <div className="q-summary-grid">
        <SummaryCard title="Tổng câu hỏi" value={total} />
        <SummaryCard title="Đang dùng" value={totalActive} accent="#4ade80" />
        <SummaryCard title="Câu liệt" value={totalCritical} accent="#ff5a5f" />
      </div>

      {error && <div className="q-error">{error}</div>}

      <FilterBar filters={filters} topics={topics} onChange={handleFilters} />

      <QuestionTable
        questions={questions}
        topics={topics}
        loading={loading}
        onEdit={(id) => navigate(`/questions/${id}/edit`)}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        pageSize={PAGE_SIZE}
        onChange={setCurrentPage}
      />
    </div>
  );
}
