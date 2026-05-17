import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { questionService, topicService } from '@/services';
import type { QuestionFormData, TopicResponse } from '../../types/question.types';
import {
  DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  LICENSE_CATEGORY_OPTIONS,
  type LicenseCategory,
  type QuestionDifficulty,
  type QuestionType,
} from '../../types/question.types';
import './index.css';

const DEFAULT_FORM: QuestionFormData = {
  content: '',
  type: '',
  isCritical: false,
  difficulty: '',
  licenseCategories: [],
  topicId: '',
  isActive: true,
  options: [
    { content: '', isCorrect: false, displayOrder: 1 },
    { content: '', isCorrect: false, displayOrder: 2 },
    { content: '', isCorrect: false, displayOrder: 3 },
    { content: '', isCorrect: false, displayOrder: 4 },
  ],
  explanation: '',
};

export default function AddQuestionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<QuestionFormData>(DEFAULT_FORM);
  const [version, setVersion] = useState<number>(1);
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof QuestionFormData | 'options', string>>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    topicService.list({ size: 100 }).then((res) => {
      if (res.success) setTopics(res.data.items);
    });
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    setFetchLoading(true);
    questionService.getById(id).then((res) => {
      setFetchLoading(false);
      if (res.success) {
        const q = res.data;
        setVersion(q.version);
        setForm({
          content: q.content,
          type: q.type,
          isCritical: q.isCritical,
          difficulty: q.difficulty,
          licenseCategories: [...q.licenseCategories],
          topicId: q.topicId,
          isActive: q.isActive,
          options: q.options
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((o) => ({ content: o.content, isCorrect: o.isCorrect, displayOrder: o.displayOrder })),
          explanation: q.explanation,
        });
      } else {
        setSubmitError(res.error);
      }
    });
  }, [isEdit, id]);

  const update = (patch: Partial<QuestionFormData>) => setForm((f) => ({ ...f, ...patch }));

  const updateOption = (index: number, field: 'content' | 'isCorrect', value: string | boolean) => {
    const next = form.options.map((o, i) => {
      if (i !== index) return o;
      if (field === 'isCorrect') return { ...o, isCorrect: value as boolean };
      return { ...o, content: value as string };
    });
    update({ options: next });
  };

  const toggleLicenseCategory = (cls: LicenseCategory) => {
    const next = form.licenseCategories.includes(cls)
      ? form.licenseCategories.filter((c) => c !== cls)
      : [...form.licenseCategories, cls];
    update({ licenseCategories: next });
    setErrors((er) => ({ ...er, licenseCategories: '' }));
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.content.trim()) errs.content = 'Vui lòng nhập nội dung câu hỏi';
    if (!form.type) errs.type = 'Vui lòng chọn loại câu hỏi';
    if (form.licenseCategories.length === 0) errs.licenseCategories = 'Vui lòng chọn ít nhất một hạng bằng';
    if (!form.topicId) errs.topicId = 'Vui lòng chọn chủ đề';
    if (!form.difficulty) errs.difficulty = 'Vui lòng chọn độ khó';
    const hasCorrect = form.options.some((o) => o.isCorrect);
    if (!hasCorrect) errs.options = 'Vui lòng chọn một đáp án đúng';
    const hasEmpty = form.options.some((o) => !o.content.trim());
    if (hasEmpty) errs.options = errs.options ?? 'Vui lòng điền đầy đủ các đáp án';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');

    const payload = {
      content: form.content.trim(),
      type: form.type as QuestionType,
      licenseCategories: form.licenseCategories,
      difficulty: form.difficulty as QuestionDifficulty,
      explanation: form.explanation.trim(),
      isCritical: form.isCritical,
      isActive: form.isActive,
      topicId: form.topicId,
      options: form.options.map((o) => ({
        content: o.content.trim(),
        isCorrect: o.isCorrect,
        displayOrder: o.displayOrder,
      })),
    };

    const result = isEdit && id
      ? await questionService.update(id, { ...payload, version })
      : await questionService.create(payload);

    setLoading(false);

    if (result.success) {
      navigate('/questions');
    } else {
      setSubmitError(result.error);
    }
  };

  if (fetchLoading) {
    return <div className="add-q"><div className="add-q__loading">Đang tải...</div></div>;
  }

  return (
    <div className="add-q">
      <div className="add-q__header">
        <button className="add-q__back" onClick={() => navigate('/questions')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <h1>{isEdit ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}</h1>
          <p>{isEdit ? 'Cập nhật thông tin câu hỏi' : 'Tạo câu hỏi mới cho ngân hàng đề'}</p>
        </div>
      </div>

      {submitError && <div className="add-q__submit-error">{submitError}</div>}

      <div className="add-q__body">
        {/* ─── Left panel ─── */}
        <div className="add-q__main">
          {/* Content */}
          <div className="add-q__section">
            <div className="add-q__section-title">Nội Dung Câu Hỏi</div>
            <div className="add-q__form-group">
              <label>Câu hỏi *</label>
              <textarea
                value={form.content}
                onChange={(e) => { update({ content: e.target.value }); setErrors((er) => ({ ...er, content: '' })); }}
                placeholder="Nhập nội dung câu hỏi..."
                rows={3}
                className={errors.content ? 'add-q__input--error' : ''}
              />
              {errors.content && <span className="add-q__error">{errors.content}</span>}
            </div>

            <div className="add-q__form-group">
              <label>Hình ảnh minh họa</label>
              <div
                className={`add-q__upload-zone ${isDragging ? 'add-q__upload-zone--drag' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" hidden />
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="add-q__upload-icon">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p>Kéo thả hoặc click để tải hình ảnh</p>
                <span>PNG, JPG lên đến 5MB</span>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="add-q__section">
            <div className="add-q__section-title">Đáp Án</div>
            {errors.options && <span className="add-q__error">{errors.options}</span>}
            <div className="add-q__options">
              {form.options.map((opt, idx) => {
                const label = String.fromCharCode(65 + idx);
                return (
                  <div key={idx} className="add-q__option-row">
                    <div className="add-q__option-left">
                      <label className="add-q__option-correct-label">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={opt.isCorrect}
                          onChange={() => updateOption(idx, 'isCorrect', true)}
                        />
                        <span>Đúng</span>
                      </label>
                    </div>
                    <div className="add-q__option-key">{label}</div>
                    <input
                      className="add-q__option-input"
                      value={opt.content}
                      onChange={(e) => updateOption(idx, 'content', e.target.value)}
                      placeholder={`Nhập nội dung đáp án ${label}...`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <div className="add-q__section">
            <div className="add-q__section-title">Giải Thích</div>
            <div className="add-q__form-group">
              <label>Giải thích đáp án</label>
              <textarea
                value={form.explanation}
                onChange={(e) => update({ explanation: e.target.value })}
                placeholder="Nhập giải thích chi tiết về đáp án đúng..."
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* ─── Right sidebar ─── */}
        <div className="add-q__sidebar">
          <div className="add-q__sidebar-card">
            <div className="add-q__sidebar-title">Thông Tin</div>

            {/* Type */}
            <div className="add-q__form-group">
              <label>Loại câu hỏi *</label>
              <select
                value={form.type}
                onChange={(e) => { update({ type: e.target.value as QuestionType }); setErrors((er) => ({ ...er, type: '' })); }}
                className={errors.type ? 'add-q__input--error' : ''}
              >
                <option value="">Chọn loại</option>
                {QUESTION_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.type && <span className="add-q__error">{errors.type}</span>}
            </div>

            {/* License categories */}
            <div className="add-q__form-group">
              <label>Hạng bằng * <span className="add-q__hint">(chọn nhiều)</span></label>
              <div className={`add-q__checkbox-group ${errors.licenseCategories ? 'add-q__input--error' : ''}`}>
                {LICENSE_CATEGORY_OPTIONS.map((cls) => (
                  <label key={cls} className="add-q__checkbox-item">
                    <input
                      type="checkbox"
                      checked={form.licenseCategories.includes(cls)}
                      onChange={() => toggleLicenseCategory(cls)}
                    />
                    <span>{cls}</span>
                  </label>
                ))}
              </div>
              {errors.licenseCategories && <span className="add-q__error">{errors.licenseCategories}</span>}
            </div>

            {/* Topic */}
            <div className="add-q__form-group">
              <label>Chủ đề *</label>
              <select
                value={form.topicId}
                onChange={(e) => { update({ topicId: e.target.value }); setErrors((er) => ({ ...er, topicId: '' })); }}
                className={errors.topicId ? 'add-q__input--error' : ''}
              >
                <option value="">Chọn chủ đề</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {errors.topicId && <span className="add-q__error">{errors.topicId}</span>}
            </div>

            {/* Difficulty */}
            <div className="add-q__form-group">
              <label>Độ khó *</label>
              <div className="add-q__difficulty-group">
                {DIFFICULTY_OPTIONS.map((d) => (
                  <label
                    key={d.value}
                    className={`add-q__difficulty-option ${form.difficulty === d.value ? 'add-q__difficulty-option--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={d.value}
                      checked={form.difficulty === d.value}
                      onChange={() => { update({ difficulty: d.value as QuestionDifficulty }); setErrors((er) => ({ ...er, difficulty: '' })); }}
                    />
                    <span className={`add-q__difficulty-dot add-q__difficulty-dot--${d.value.toLowerCase()}`} />
                    {d.label}
                  </label>
                ))}
              </div>
              {errors.difficulty && <span className="add-q__error">{errors.difficulty}</span>}
            </div>

            {/* Flags */}
            <label className="add-q__critical-label">
              <input
                type="checkbox"
                checked={form.isCritical}
                onChange={(e) => update({ isCritical: e.target.checked })}
              />
              <span>Câu hỏi điểm liệt</span>
            </label>

            <label className="add-q__critical-label" style={{ marginTop: '8px' }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update({ isActive: e.target.checked })}
              />
              <span>Kích hoạt câu hỏi</span>
            </label>
          </div>

          {/* Actions */}
          <button className="add-q__submit-btn" onClick={handleSubmit} disabled={loading}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {loading ? 'Đang lưu...' : isEdit ? 'Lưu Thay Đổi' : 'Tạo Mới'}
          </button>
          <button className="add-q__cancel-btn" onClick={() => navigate('/questions')} disabled={loading}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
