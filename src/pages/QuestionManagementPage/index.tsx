import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncData } from '@/hooks/useAsyncData';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import type { PaginatedLoaderParams } from '@/hooks/usePaginatedList';
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
import { TopicModal } from './components/TopicModal';
import './index.css';

const DEFAULT_FILTERS: QuestionFilters = {
  keyword: '',
  licenseCategory: '',
  type: '',
  difficulty: '',
  topicId: '',
  includeDeleted: false,
};

const EMPTY_TOPICS: TopicResponse[] = [];

const EMPTY_QUESTION_STATS = {
  totalActive: 0,
  totalCritical: 0,
};

export default function QuestionManagementPage() {
  const navigate = useNavigate();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [topicModalOpen, setTopicModalOpen] = useState(false);

  const loadQuestions = useCallback(
    ({ page, pageSize, filters }: PaginatedLoaderParams<QuestionFilters>) =>
      questionService.list({
        page,
        size: pageSize,
        ...(filters.keyword ? { keyword: filters.keyword } : {}),
        ...(filters.licenseCategory ? { licenseCategory: filters.licenseCategory } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
        ...(filters.topicId ? { topicId: filters.topicId } : {}),
        ...(filters.includeDeleted ? { includeDeleted: true } : {}),
      }),
    [],
  );
  const questionsList = usePaginatedList<QuestionResponse, QuestionFilters>(
    loadQuestions,
    { initialFilters: DEFAULT_FILTERS },
  );

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

  const handleDelete = async (id: string, version: number) => {
    if (!window.confirm('Xác nhận xóa câu hỏi này?')) return;
    setDeleteError(null);
    const result = await questionService.delete(id, version);
    if (result.success) {
      questionsList.refetch();
      statsQuery.refetch();
    } else {
      setDeleteError(result.error);
    }
  };

  const questions = questionsList.items;
  const topics = topicsQuery.data;
  const total = questionsList.total;
  const { totalActive, totalCritical } = statsQuery.data;

  return (
    <div className="q-management">
      <div className="q-management__header">
        <div>
          <h1>Ngân Hàng Câu Hỏi</h1>
          <p>Quản lý câu hỏi thi lý thuyết và lịch sử chỉnh sửa</p>
        </div>
        <div className="q-management__header-actions">
          <button className="q-topic-btn" onClick={() => setTopicModalOpen(true)}>
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

      {questionsList.error && <div className="q-error">{questionsList.error}</div>}
      {deleteError && <div className="q-error">{deleteError}</div>}

      <FilterBar filters={questionsList.filters} topics={topics} onChange={questionsList.setFilters} />

      <QuestionTable
        questions={questions}
        topics={topics}
        loading={questionsList.loading}
        onEdit={(id) => navigate(`/questions/${id}/edit`)}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={questionsList.page}
        totalPages={questionsList.totalPages}
        totalItems={total}
        pageSize={DEFAULT_PAGE_SIZE}
        label="câu hỏi"
        onChange={questionsList.setPage}
      />

      {topicModalOpen && (
        <TopicModal
          topics={topics}
          onClose={() => setTopicModalOpen(false)}
          onTopicsChanged={topicsQuery.refetch}
        />
      )}
    </div>
  );
}
