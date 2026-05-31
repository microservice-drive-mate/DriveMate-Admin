import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncData } from '@/hooks/useAsyncData';
import { questionService, topicService } from '@/services';
import type {
  QuestionFilters,
  QuestionResponse,
  TopicResponse,
} from '../../types/question.types';
import Pagination from '../../components/Pagination';
import { DEFAULT_PAGE_SIZE } from '../../constants/pagination';
import { FilterBar } from './components/FilterBar';
import { QuestionTable } from './components/QuestionTable';
import { SummaryCard } from './components/SummaryCard';
import './index.css';

const DEFAULT_FILTERS: QuestionFilters = {
  keyword: '',
  licenseCategory: '',
  type: '',
  difficulty: '',
  topicId: '',
  includeDeleted: false,
};

const EMPTY_QUESTION_PAGE = {
  items: [] as QuestionResponse[],
  total: 0,
  page: 1,
  size: DEFAULT_PAGE_SIZE,
};

const EMPTY_TOPICS: TopicResponse[] = [];

const EMPTY_QUESTION_STATS = {
  totalActive: 0,
  totalCritical: 0,
};

const EMPTY_TOPIC_FORM = { name: '', description: '', parentId: '' };

export default function QuestionManagementPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<QuestionFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [topicForm, setTopicForm] = useState(EMPTY_TOPIC_FORM);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicModalLoading, setTopicModalLoading] = useState(false);
  const [topicModalError, setTopicModalError] = useState<string | null>(null);

  const loadQuestions = useCallback(() => {
    const params = {
      page: currentPage,
      size: DEFAULT_PAGE_SIZE,
      ...(filters.keyword ? { keyword: filters.keyword } : {}),
      ...(filters.licenseCategory ? { licenseCategory: filters.licenseCategory } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters.topicId ? { topicId: filters.topicId } : {}),
      ...(filters.includeDeleted ? { includeDeleted: true } : {}),
    };
    return questionService.list(params);
  }, [currentPage, filters]);
  const questionsQuery = useAsyncData(loadQuestions, {
    initialData: EMPTY_QUESTION_PAGE,
    retainPreviousData: false,
  });

  const loadTopics = useCallback(async () => {
    const result = await topicService.list({ size: 100 });
    if (!result.success) return result;
    return { success: true as const, data: result.data.items };
  }, []);
  const topicsQuery = useAsyncData(loadTopics, { initialData: EMPTY_TOPICS });

  const loadStats = useCallback(async () => {
    const [activeRes, criticalRes] = await Promise.all([
      questionService.list({ size: 1, isActive: true }),
      questionService.list({ size: 1, isCritical: true }),
    ]);

    return {
      success: true as const,
      data: {
        totalActive: activeRes.success ? activeRes.data.total : 0,
        totalCritical: criticalRes.success ? criticalRes.data.total : 0,
      },
    };
  }, []);
  const statsQuery = useAsyncData(loadStats, {
    initialData: EMPTY_QUESTION_STATS,
  });

  const handleOpenEditTopic = (topic: TopicResponse) => {
    setEditingTopicId(topic.id);
    setTopicForm({ name: topic.name, description: topic.description ?? '', parentId: topic.parentId ?? '' });
    setTopicModalError(null);
  };

  const handleTopicFormReset = () => {
    setEditingTopicId(null);
    setTopicForm(EMPTY_TOPIC_FORM);
    setTopicModalError(null);
  };

  const handleTopicSave = async () => {
    if (!topicForm.name.trim()) {
      setTopicModalError('Tên topic không được để trống.');
      return;
    }
    setTopicModalLoading(true);
    setTopicModalError(null);
    const payload = {
      name: topicForm.name.trim(),
      description: topicForm.description.trim() || undefined,
      parentId: topicForm.parentId || null,
    };
    const result = editingTopicId
      ? await topicService.update(editingTopicId, payload)
      : await topicService.create(payload);
    setTopicModalLoading(false);
    if (!result.success) {
      setTopicModalError(result.error);
      return;
    }
    handleTopicFormReset();
    topicsQuery.refetch();
  };

  const handleFilters = (next: QuestionFilters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string, version: number) => {
    if (!window.confirm('Xác nhận xóa câu hỏi này?')) return;
    setDeleteError(null);
    const result = await questionService.delete(id, version);
    if (result.success) {
      questionsQuery.refetch();
      statsQuery.refetch();
    } else {
      setDeleteError(result.error);
    }
  };

  const questions = questionsQuery.data.items;
  const topics = topicsQuery.data;
  const total = questionsQuery.data.total;
  const { totalActive, totalCritical } = statsQuery.data;
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

  return (
    <div className="q-management">
      <div className="q-management__header">
        <div>
          <h1>Ngân Hàng Câu Hỏi</h1>
          <p>Quản lý câu hỏi thi lý thuyết và lịch sử chỉnh sửa</p>
        </div>
        <div className="q-management__header-actions">
          <button className="q-topic-btn" onClick={() => { handleTopicFormReset(); setTopicModalOpen(true); }}>
            📚 Quản Lý Topic
          </button>
          <button className="q-management__add" onClick={() => navigate('/questions/new')}>
            + Thêm Câu Hỏi
          </button>
        </div>
      </div>

      <div className="q-summary-grid">
        <SummaryCard title="Tổng câu hỏi" value={total} />
        <SummaryCard title="Đang dùng" value={totalActive} accent="#4ade80" />
        <SummaryCard title="Câu liệt" value={totalCritical} accent="#ff5a5f" />
      </div>

      {questionsQuery.error && <div className="q-error">{questionsQuery.error}</div>}
      {deleteError && <div className="q-error">{deleteError}</div>}

      <FilterBar filters={filters} topics={topics} onChange={handleFilters} />

      <QuestionTable
        questions={questions}
        topics={topics}
        loading={questionsQuery.loading}
        onEdit={(id) => navigate(`/questions/${id}/edit`)}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        pageSize={DEFAULT_PAGE_SIZE}
        label="câu hỏi"
        onChange={setCurrentPage}
      />

      {topicModalOpen && (
        <div className="q-topic-modal">
          <div className="q-topic-modal__box">
            <div className="q-topic-modal__header">
              <span>{editingTopicId ? 'Sửa Topic' : 'Quản Lý Topic'}</span>
              <button className="q-topic-modal__close" onClick={() => { setTopicModalOpen(false); handleTopicFormReset(); }}>×</button>
            </div>

            <div className="q-topic-modal__form">
              <p className="q-topic-modal__form-title">
                {editingTopicId ? 'Cập nhật topic' : 'Thêm topic mới'}
              </p>
              {topicModalError && <div className="q-topic-modal__error">{topicModalError}</div>}
              <div className="q-topic-modal__field">
                <label>Tên topic *</label>
                <input
                  value={topicForm.name}
                  onChange={(e) => setTopicForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="VD: BiỒn báo giao thông"
                />
              </div>
              <div className="q-topic-modal__field">
                <label>Mô tả</label>
                <input
                  value={topicForm.description}
                  onChange={(e) => setTopicForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả ngắn (tùy chọn)"
                />
              </div>
              <div className="q-topic-modal__field">
                <label>Topic cha</label>
                <select
                  value={topicForm.parentId}
                  onChange={(e) => setTopicForm((f) => ({ ...f, parentId: e.target.value }))}>
                  <option value="">Không có</option>
                  {topics
                    .filter((t) => t.id !== editingTopicId)
                    .map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
              </div>
              <div className="q-topic-modal__form-actions">
                <button
                  className="q-topic-modal__btn q-topic-modal__btn--primary"
                  onClick={handleTopicSave}
                  disabled={topicModalLoading}>
                  {topicModalLoading ? 'Đang lưu...' : editingTopicId ? 'Cập nhật' : 'Thêm'}
                </button>
                {editingTopicId && (
                  <button className="q-topic-modal__btn" onClick={handleTopicFormReset} disabled={topicModalLoading}>
                    Hủy sửa
                  </button>
                )}
              </div>
            </div>

            <div className="q-topic-modal__list">
              <p className="q-topic-modal__list-title">Danh sách topic ({topics.length})</p>
              {topics.length === 0 ? (
                <p className="q-topic-modal__empty">Chưa có topic nào.</p>
              ) : (
                topics.map((t) => (
                  <div
                    key={t.id}
                    className={`q-topic-modal__row${editingTopicId === t.id ? ' q-topic-modal__row--editing' : ''}`}>
                    <div className="q-topic-modal__row-info">
                      <span className="q-topic-modal__row-name">{t.name}</span>
                      {t.description && (
                        <span className="q-topic-modal__row-desc">{t.description}</span>
                      )}
                    </div>
                    <button
                      className="q-topic-modal__edit-btn"
                      onClick={() => handleOpenEditTopic(t)}
                      disabled={topicModalLoading}>
                      Sửa
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
