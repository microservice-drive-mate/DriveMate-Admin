import { useMemo, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_QUESTIONS, QUESTION_STATS } from '../../data/questionData';
import type { Question, QuestionFilters, QuestionDifficulty, QuestionStatus } from '../../types/question.types';
import {
  DIFFICULTY_LABELS,
  TOPIC_OPTIONS,
  LICENSE_CLASS_OPTIONS,
} from '../../types/question.types';
import './index.css';

const PAGE_SIZE = 10;

const DIFFICULTY_CLASS: Record<QuestionDifficulty, string> = {
  easy: 'q-badge--easy',
  medium: 'q-badge--medium',
  hard: 'q-badge--hard',
};

function SummaryCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="q-summary-card">
      <div className="q-summary-card__title">{title}</div>
      <div
        className="q-summary-card__value"
        style={accent ? { color: accent } : undefined}
      >
        {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
      </div>
    </div>
  );
}

function FilterBar({
  filters,
  onChange,
}: {
  filters: QuestionFilters;
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
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Tìm kiếm câu hỏi..."
        />
      </div>

      <select value={filters.licenseClass} onChange={(e) => update({ licenseClass: e.target.value })}>
        <option value="">Hạng bằng</option>
        {LICENSE_CLASS_OPTIONS.map((cls) => (
          <option key={cls} value={cls}>{cls}</option>
        ))}
      </select>

      <select value={filters.topic} onChange={(e) => update({ topic: e.target.value })}>
        <option value="">Chủ đề</option>
        {TOPIC_OPTIONS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select value={filters.difficulty} onChange={(e) => update({ difficulty: e.target.value })}>
        <option value="">Độ khó</option>
        <option value="easy">Dễ</option>
        <option value="medium">TB</option>
        <option value="hard">Khó</option>
      </select>

      <button
        className="q-filters__btn"
        onClick={() => onChange({ search: filters.search, licenseClass: filters.licenseClass, topic: filters.topic, difficulty: filters.difficulty })}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Lọc
      </button>
    </div>
  );
}

function ActionMenu({
  questionId,
  status,
  onEdit,
  onDelete,
  onRestore,
}: {
  questionId: number;
  status: QuestionStatus;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
          <button
            onClick={() => { onEdit(questionId); setOpen(false); }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Chỉnh sửa
          </button>
          {status !== 'deleted' ? (
            <button
              className="q-action-menu__item--danger"
              onClick={() => { onDelete(questionId); setOpen(false); }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
              Xóa
            </button>
          ) : (
            <button
              className="q-action-menu__item--restore"
              onClick={() => { onRestore(questionId); setOpen(false); }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
              </svg>
              Kích hoạt lại
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionTable({
  questions,
  onEdit,
  onDelete,
  onRestore,
}: {
  questions: Question[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}) {
  if (!questions.length) {
    return <div className="q-empty">Không tìm thấy câu hỏi nào.</div>;
  }

  return (
    <div className="q-table-wrap">
      <table className="q-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nội Dung</th>
            <th>Loại</th>
            <th>Hạng</th>
            <th>Chủ Đề</th>
            <th>Độ Khó</th>
            <th>Version</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.id} className={q.status === 'deleted' ? 'q-table__row--deleted' : ''}>
              <td className="q-table__id">#{q.id}</td>
              <td className="q-table__content">
                <span title={q.content}>{q.content}</span>
              </td>
              <td>
                {q.isCritical ? (
                  <span className="q-type-badge q-type-badge--critical">Câu liệt</span>
                ) : (
                  <span className="q-type-badge">Trắc nghiệm</span>
                )}
              </td>
              <td>
                <span className="q-class-badge">{q.licenseClass}</span>
              </td>
              <td className="q-table__topic">{q.topic}</td>
              <td>
                <span className={`q-badge ${DIFFICULTY_CLASS[q.difficulty]}`}>
                  {DIFFICULTY_LABELS[q.difficulty]}
                </span>
              </td>
              <td>
                <div className="q-version-cell">
                  <span>v{q.version}</span>
                  {q.versions.length > 1 && (
                    <button className="q-version-btn" onClick={() => {}} title="Lịch sử phiên bản">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
              <td>
                <ActionMenu
                  questionId={q.id}
                  status={q.status}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRestore={onRestore}
                />
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
    <div className="q-pagination">
      <span className="q-pagination__info">
        Hiển thị {start}–{end} / {totalItems} câu hỏi
      </span>
      <div className="q-pagination__controls">
        <button disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>
          Trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={page === currentPage ? 'q-pagination__page--active' : ''}
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

export default function QuestionManagementPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [filters, setFilters] = useState<QuestionFilters>({
    search: '',
    licenseClass: '',
    topic: '',
    difficulty: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return questions.filter((item) => {
      const matchSearch = !q || item.content.toLowerCase().includes(q);
      const matchClass = !filters.licenseClass || item.licenseClass === filters.licenseClass;
      const matchTopic = !filters.topic || item.topic === filters.topic;
      const matchDiff = !filters.difficulty || item.difficulty === filters.difficulty;
      return matchSearch && matchClass && matchTopic && matchDiff;
    });
  }, [questions, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const handleFilters = (next: QuestionFilters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const handleDelete = (id: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'deleted' as const } : q)),
    );
  };

  const handleRestore = (id: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'active' as const } : q)),
    );
  };

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
        <SummaryCard title="Tổng câu hỏi" value={QUESTION_STATS.total} />
        <SummaryCard title="Đang dùng" value={QUESTION_STATS.active} accent="#4ade80" />
        <SummaryCard title="Câu liệt" value={QUESTION_STATS.critical} accent="#ff5a5f" />
        <SummaryCard title="Đã xóa" value={QUESTION_STATS.deleted} />
        <SummaryCard title="Chỉnh sửa" value={QUESTION_STATS.edited} accent="#f9c74f" />
      </div>

      <FilterBar filters={filters} onChange={handleFilters} />

      <QuestionTable
        questions={paginated}
        onEdit={(id) => navigate(`/questions/${id}/edit`)}
        onDelete={handleDelete}
        onRestore={handleRestore}
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
