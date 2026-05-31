import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examService, topicService } from '@/services';
import type {
  ExamTemplateFormData,
  LicenseCategory,
  TopicDistributionItem,
} from '@/types/exam-template.types';
import {
  LICENSE_CATEGORIES,
  LICENSE_CATEGORY_DEFAULTS,
} from '@/types/exam-template.types';
import type { TopicResponse } from '@/types/question.types';
import './AddExamConfigPage.css';

const DEFAULT_FORM: ExamTemplateFormData = {
  name: '',
  description: '',
  licenseCategory: '',
  totalQuestions: 30,
  passingScore: 27,
  durationMinutes: 22,
  criticalQuestions: 1,
  maxCriticalMistakes: 0,
  shuffleQuestions: true,
  topicDistribution: [],
  isActive: true,
};

interface FormErrors {
  name?: string;
  licenseCategory?: string;
  totalQuestions?: string;
  passingScore?: string;
  durationMinutes?: string;
  criticalQuestions?: string;
  maxCriticalMistakes?: string;
  topicDistribution?: string;
}

export default function AddExamConfigPage() {
  const { configId } = useParams<{ configId: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(configId);

  const [form, setForm] = useState<ExamTemplateFormData>(DEFAULT_FORM);
  const [version, setVersion] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadedConfigId, setLoadedConfigId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [topics, setTopics] = useState<TopicResponse[]>([]);

  useEffect(() => {
    topicService.list({ size: 100 }).then((res) => {
      if (res.success) setTopics(res.data.items);
    });
  }, []);

  useEffect(() => {
    if (!isEdit || !configId) return;
    examService.getById(configId).then((res) => {
      setLoadedConfigId(configId);
      if (res.success) {
        setForm({
          name: res.data.name,
          description: res.data.description ?? '',
          licenseCategory: res.data.licenseCategory,
          totalQuestions: res.data.totalQuestions,
          passingScore: res.data.passingScore,
          durationMinutes: res.data.durationMinutes,
          criticalQuestions: res.data.criticalQuestions ?? 1,
          maxCriticalMistakes: res.data.maxCriticalMistakes ?? 0,
          shuffleQuestions: res.data.shuffleQuestions ?? true,
          topicDistribution: res.data.topicDistribution ?? [],
          isActive: res.data.isActive,
        });
        setVersion(res.data.version);
      } else {
        setSubmitError(res.error);
      }
    });
  }, [isEdit, configId]);

  const updateForm = (patch: Partial<ExamTemplateFormData>) =>
    setForm((f) => ({ ...f, ...patch }));

  const handleLicenseChange = (cls: string) => {
    if (cls && cls in LICENSE_CATEGORY_DEFAULTS) {
      const key = cls as LicenseCategory;
      updateForm({
        licenseCategory: key,
        ...LICENSE_CATEGORY_DEFAULTS[key],
      });
    } else {
      updateForm({ licenseCategory: cls as LicenseCategory | '' });
    }
  };

  const addTopicRow = () => {
    updateForm({ topicDistribution: [...form.topicDistribution, { topicId: '', questionCount: 1 }] });
  };

  const removeTopicRow = (index: number) => {
    updateForm({ topicDistribution: form.topicDistribution.filter((_, i) => i !== index) });
  };

  const updateTopicRow = (index: number, patch: Partial<TopicDistributionItem>) => {
    updateForm({
      topicDistribution: form.topicDistribution.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    });
  };

  const topicDistributionTotal = form.topicDistribution.reduce((sum, r) => sum + (r.questionCount || 0), 0);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Vui lòng nhập tên đề thi.';
    if (!form.licenseCategory) next.licenseCategory = 'Vui lòng chọn hạng bằng.';
    if (form.totalQuestions < 1) next.totalQuestions = 'Tối thiểu 1 câu.';
    if (form.passingScore < 1) next.passingScore = 'Tối thiểu 1 điểm.';
    if (form.passingScore > form.totalQuestions)
      next.passingScore = 'Điểm chuẩn không thể lớn hơn tổng số câu.';
    if (form.durationMinutes < 1 || form.durationMinutes > 180)
      next.durationMinutes = 'Thời gian từ 1 đến 180 phút.';
    if (form.criticalQuestions < 0) next.criticalQuestions = 'Số câu điểm liệt phải >= 0.';
    if (form.maxCriticalMistakes < 0) next.maxCriticalMistakes = 'Số lỗi điểm liệt tối đa phải >= 0.';
    if (form.topicDistribution.length > 0) {
      const hasEmpty = form.topicDistribution.some((r) => !r.topicId);
      if (hasEmpty) {
        next.topicDistribution = 'Vui lòng chọn topic cho tất cả các dòng.';
      } else if (topicDistributionTotal !== form.totalQuestions) {
        next.topicDistribution = `Tổng số câu theo topic (${topicDistributionTotal}) phải bằng tổng số câu (${form.totalQuestions}).`;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');

    if (isEdit && configId) {
      const res = await examService.update(configId, {
        version,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        totalQuestions: form.totalQuestions,
        passingScore: form.passingScore,
        durationMinutes: form.durationMinutes,
        criticalQuestions: form.criticalQuestions,
        maxCriticalMistakes: form.maxCriticalMistakes,
        shuffleQuestions: form.shuffleQuestions,
        topicDistribution: form.topicDistribution.length > 0 ? form.topicDistribution : undefined,
        isActive: form.isActive,
      });
      setSubmitting(false);
      if (res.success) {
        navigate('/exam-config');
      } else {
        setSubmitError(res.error);
      }
    } else {
      const res = await examService.create({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        licenseCategory: form.licenseCategory as LicenseCategory,
        totalQuestions: form.totalQuestions,
        passingScore: form.passingScore,
        durationMinutes: form.durationMinutes,
        criticalQuestions: form.criticalQuestions,
        maxCriticalMistakes: form.maxCriticalMistakes,
        shuffleQuestions: form.shuffleQuestions,
        topicDistribution: form.topicDistribution,
      });
      setSubmitting(false);
      if (res.success) {
        navigate('/exam-config');
      } else {
        setSubmitError(res.error);
      }
    }
  };

  const previewClass = form.licenseCategory || 'B1';
  const fetchLoading = isEdit && Boolean(configId) && loadedConfigId !== configId;

  if (fetchLoading) {
    return <div style={{ padding: 24 }}>Đang tải...</div>;
  }

  return (
    <div className="add-ec">
      <div className="add-ec__header">
        <div className="add-ec__header-left">
          <button className="add-ec__back" onClick={() => navigate('/exam-config')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <h1>{isEdit ? 'Chỉnh Sửa Đề Thi' : 'Thêm Đề Thi Mới'}</h1>
            <p>{isEdit ? 'Cập nhật template đề thi' : 'Tạo template đề thi mới'}</p>
          </div>
        </div>
      </div>

      {submitError && (
        <div style={{ color: '#ef4444', padding: '12px 16px' }}>
          Lỗi: {submitError}
        </div>
      )}

      <div className="add-ec__body">
        <div className="add-ec__main">
          <div className="add-ec__section">
            <div className="add-ec__section-title">Thông Tin Cơ Bản</div>
            <div className="add-ec__form-body">
              <div className="add-ec__form-group">
                <label>
                  Hạng bằng lái <span className="add-ec__required">*</span>
                </label>
                <select
                  value={form.licenseCategory}
                  onChange={(e) => handleLicenseChange(e.target.value)}
                  disabled={isEdit}>
                  <option value="">Chọn hạng bằng</option>
                  {LICENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {isEdit && (
                  <span className="add-ec__hint">
                    Không thể thay đổi hạng bằng sau khi tạo.
                  </span>
                )}
                {errors.licenseCategory && (
                  <span className="add-ec__hint" style={{ color: '#ef4444' }}>
                    {errors.licenseCategory}
                  </span>
                )}
              </div>

              <div className="add-ec__form-group">
                <label>
                  Tên đề thi <span className="add-ec__required">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  placeholder="VD: Đề thi B1 cơ bản"
                />
                {errors.name && (
                  <span className="add-ec__hint" style={{ color: '#ef4444' }}>
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="add-ec__form-group">
                <label>Mô tả</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="Mô tả ngắn về đề thi (không bắt buộc)"
                />
              </div>
            </div>
          </div>

          <div className="add-ec__section">
            <div className="add-ec__section-title">Cấu Hình Câu Hỏi</div>
            <div className="add-ec__form-body">
              <div className="add-ec__form-row">
                <div className="add-ec__form-group">
                  <label>
                    Tổng số câu hỏi <span className="add-ec__required">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.totalQuestions}
                    onChange={(e) =>
                      updateForm({ totalQuestions: Number(e.target.value) })
                    }
                  />
                  <span className="add-ec__hint">Số câu hỏi trong 1 đề thi</span>
                  {errors.totalQuestions && (
                    <span className="add-ec__hint" style={{ color: '#ef4444' }}>
                      {errors.totalQuestions}
                    </span>
                  )}
                </div>
                <div className="add-ec__form-group">
                  <label>
                    Điểm chuẩn <span className="add-ec__required">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.passingScore}
                    onChange={(e) =>
                      updateForm({ passingScore: Number(e.target.value) })
                    }
                  />
                  <span className="add-ec__hint">Số câu đúng tối thiểu để đạt</span>
                  {errors.passingScore && (
                    <span className="add-ec__hint" style={{ color: '#ef4444' }}>
                      {errors.passingScore}
                    </span>
                  )}
                </div>
              </div>

              <div className="add-ec__form-row">
                <div className="add-ec__form-group">
                  <label>
                    Câu điểm liệt <span className="add-ec__required">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.criticalQuestions}
                    onChange={(e) =>
                      updateForm({ criticalQuestions: Number(e.target.value) })
                    }
                  />
                  <span className="add-ec__hint">Số câu hỏi có tính điểm liệt trong đề</span>
                  {errors.criticalQuestions && (
                    <span className="add-ec__hint" style={{ color: '#ef4444' }}>
                      {errors.criticalQuestions}
                    </span>
                  )}
                </div>
                <div className="add-ec__form-group">
                  <label>
                    Lỗi điểm liệt tối đa <span className="add-ec__required">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxCriticalMistakes}
                    onChange={(e) =>
                      updateForm({ maxCriticalMistakes: Number(e.target.value) })
                    }
                  />
                  <span className="add-ec__hint">Số câu điểm liệt sai tối đa để vẫn đạt (thường là 0)</span>
                  {errors.maxCriticalMistakes && (
                    <span className="add-ec__hint" style={{ color: '#ef4444' }}>
                      {errors.maxCriticalMistakes}
                    </span>
                  )}
                </div>
              </div>

              <div className="add-ec__form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={form.shuffleQuestions}
                    onChange={(e) => updateForm({ shuffleQuestions: e.target.checked })}
                    style={{ marginRight: 8 }}
                  />
                  Trộn câu hỏi ngẫu nhiên
                </label>
                <span className="add-ec__hint">Mỗi lần thi câu hỏi sẽ được sắp xếp ngẫu nhiên</span>
              </div>
            </div>
          </div>

          <div className="add-ec__section">
            <div className="add-ec__section-title">Phân Bổ Topic</div>
            <div className="add-ec__form-body">
              <span className="add-ec__hint" style={{ marginBottom: 12, display: 'block' }}>
                Tuỳ chọn: xác định số câu lấy từ từng topic. Tổng số câu phải bằng {form.totalQuestions}.
                Nếu để trống, câu hỏi sẽ được lấy ngẫu nhiên từ toàn bộ ngân hàng.
              </span>

              {form.topicDistribution.map((row, index) => (
                <div key={index} className="add-ec__topic-row">
                  <select
                    value={row.topicId}
                    onChange={(e) => updateTopicRow(index, { topicId: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    <option value="">Chọn topic</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={row.questionCount}
                    onChange={(e) => updateTopicRow(index, { questionCount: Number(e.target.value) })}
                    style={{ width: 80 }}
                    placeholder="Số câu"
                  />
                  <button
                    type="button"
                    className="add-ec__topic-remove"
                    onClick={() => removeTopicRow(index)}
                  >
                    ×
                  </button>
                </div>
              ))}

              {form.topicDistribution.length > 0 && (
                <div className="add-ec__topic-total">
                  Tổng: <strong style={{ color: topicDistributionTotal === form.totalQuestions ? '#4ade80' : '#f87171' }}>
                    {topicDistributionTotal}
                  </strong> / {form.totalQuestions}
                </div>
              )}

              <button type="button" className="add-ec__topic-add" onClick={addTopicRow}>
                + Thêm topic
              </button>

              {errors.topicDistribution && (
                <span className="add-ec__hint" style={{ color: '#ef4444' }}>
                  {errors.topicDistribution}
                </span>
              )}
            </div>
          </div>

          <div className="add-ec__section">
            <div className="add-ec__section-title">Cài Đặt Bài Thi</div>
            <div className="add-ec__form-body">
              <div className="add-ec__form-row">
                <div className="add-ec__form-group">
                  <label>
                    Thời gian làm bài (phút) <span className="add-ec__required">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={form.durationMinutes}
                    onChange={(e) =>
                      updateForm({ durationMinutes: Number(e.target.value) })
                    }
                  />
                  <span className="add-ec__hint">Từ 1 đến 180 phút</span>
                  {errors.durationMinutes && (
                    <span className="add-ec__hint" style={{ color: '#ef4444' }}>
                      {errors.durationMinutes}
                    </span>
                  )}
                </div>
                {isEdit && (
                  <div className="add-ec__form-group">
                    <label>Trạng thái</label>
                    <select
                      value={form.isActive ? 'true' : 'false'}
                      onChange={(e) =>
                        updateForm({ isActive: e.target.value === 'true' })
                      }>
                      <option value="true">Đang áp dụng</option>
                      <option value="false">Ngừng áp dụng</option>
                    </select>
                    <span className="add-ec__hint">
                      Ngừng áp dụng để ẩn template khỏi danh sách thi của học viên
                    </span>
                  </div>
                )}
              </div>

              <div className="add-ec__warning">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <strong>Lưu ý:</strong>
                  <span>
                    {' '}
                    Câu hỏi điểm liệt phải được đánh dấu từ trước trong ngân hàng câu hỏi. Điều kiện đỗ: số câu đúng &gt;= điểm chuẩn VÀ số câu điểm liệt sai &lt;= lỗi điểm liệt tối đa.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="add-ec__sidebar">
          <div className="add-ec__preview-card">
            <div className="add-ec__preview-badge">{previewClass}</div>
            <div className="add-ec__preview-label">Hạng bằng lái</div>

            <div className="add-ec__preview-stats">
              <div className="add-ec__preview-stat">
                <span>Tổng câu hỏi:</span>
                <span>{form.totalQuestions} câu</span>
              </div>
              <div className="add-ec__preview-stat">
                <span>Điểm chuẩn:</span>
                <span className="add-ec__preview-stat--orange">
                  {form.passingScore}/{form.totalQuestions}
                </span>
              </div>
              <div className="add-ec__preview-stat">
                <span>Câu điểm liệt:</span>
                <span>{form.criticalQuestions} câu</span>
              </div>
              <div className="add-ec__preview-stat">
                <span>Lỗi điểm liệt tối đa:</span>
                <span>{form.maxCriticalMistakes}</span>
              </div>
              <div className="add-ec__preview-stat">
                <span>Thời gian:</span>
                <span>{form.durationMinutes} phút</span>
              </div>
              <div className="add-ec__preview-stat">
                <span>Trộn câu hỏi:</span>
                <span>{form.shuffleQuestions ? 'Có' : 'Không'}</span>
              </div>
              {isEdit && (
                <div className="add-ec__preview-stat">
                  <span>Phiên bản:</span>
                  <span>v{version}</span>
                </div>
              )}
            </div>
          </div>

          <button
            className="add-ec__submit-btn"
            onClick={handleSubmit}
            disabled={submitting}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            {submitting
              ? 'Đang lưu...'
              : isEdit
                ? 'Lưu Thay Đổi'
                : 'Tạo Đề Thi'}
          </button>
          <button
            className="add-ec__cancel-btn"
            onClick={() => navigate('/exam-config')}>
            Hủy
          </button>

          <div className="add-ec__guide">
            <div className="add-ec__guide-title">Hướng Dẫn</div>
            <ul className="add-ec__guide-list">
              <li>Điền đầy đủ các trường bắt buộc (*)</li>
              <li>Điểm chuẩn phải ≤ tổng số câu</li>
              <li>Thời gian từ 1 đến 180 phút</li>
              <li>Nếu có topic distribution, tổng câu = tổng số câu đề thi</li>
              <li>Hạng bằng không đổi được sau khi tạo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
