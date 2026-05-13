import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_QUESTIONS } from '../../data/questionData';
import type { QuestionFormData } from '../../types/question.types';
import { DIFFICULTY_LABELS, TOPIC_OPTIONS, LICENSE_CLASS_OPTIONS } from '../../types/question.types';
import './index.css';

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

const DEFAULT_FORM: QuestionFormData = {
  content: '',
  imageUrl: '',
  isCritical: false,
  difficulty: '',
  licenseClass: '',
  topic: '',
  options: [
    { key: 'A', content: '', isCorrect: false },
    { key: 'B', content: '', isCorrect: false },
    { key: 'C', content: '', isCorrect: false },
    { key: 'D', content: '', isCorrect: false },
  ],
  explanation: '',
  tags: [],
};

export default function AddQuestionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<QuestionFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof QuestionFormData, string>>>({});
  const [tagInput, setTagInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit && id) {
      const q = MOCK_QUESTIONS.find((item) => item.id === Number(id));
      if (q) {
        setForm({
          content: q.content,
          imageUrl: q.imageUrl ?? '',
          isCritical: q.isCritical,
          difficulty: q.difficulty,
          licenseClass: q.licenseClass,
          topic: q.topic,
          options: q.options.map((o) => ({ key: o.key, content: o.content, isCorrect: o.isCorrect })),
          explanation: q.explanation,
          tags: [...q.tags],
        });
      }
    }
  }, [isEdit, id]);

  const update = (patch: Partial<QuestionFormData>) => setForm((f) => ({ ...f, ...patch }));

  const updateOption = (index: number, field: 'content' | 'isCorrect', value: string | boolean) => {
    const next = form.options.map((o, i) => {
      if (field === 'isCorrect') {
        return { ...o, isCorrect: i === index ? (value as boolean) : false };
      }
      return i === index ? { ...o, [field]: value } : o;
    });
    update({ options: next });
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      update({ tags: [...form.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    update({ tags: form.tags.filter((t) => t !== tag) });
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.content.trim()) errs.content = 'Vui lòng nhập nội dung câu hỏi';
    if (!form.licenseClass) errs.licenseClass = 'Vui lòng chọn hạng bằng';
    if (!form.topic) errs.topic = 'Vui lòng chọn chủ đề';
    if (!form.difficulty) errs.difficulty = 'Vui lòng chọn độ khó';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      navigate('/questions');
    }
  };

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
            <div className="add-q__options">
              {OPTION_KEYS.map((key, idx) => {
                const opt = form.options[idx];
                return (
                  <div key={key} className="add-q__option-row">
                    <div className="add-q__option-left">
                      <label className="add-q__option-correct-label">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={opt.isCorrect}
                          onChange={() => updateOption(idx, 'isCorrect', true)}
                        />
                        <span>Đáp án đúng</span>
                      </label>
                    </div>
                    <div className="add-q__option-key">{key}</div>
                    <input
                      className="add-q__option-input"
                      value={opt.content}
                      onChange={(e) => updateOption(idx, 'content', e.target.value)}
                      placeholder={`Nhập nội dung đáp án ${key}...`}
                    />
                    <button className="add-q__option-img-btn" title="Thêm hình ảnh cho đáp án">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </button>
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
          {/* Info */}
          <div className="add-q__sidebar-card">
            <div className="add-q__sidebar-title">Thông Tin</div>

            <div className="add-q__form-group">
              <label>Hạng bằng *</label>
              <select
                value={form.licenseClass}
                onChange={(e) => { update({ licenseClass: e.target.value as QuestionFormData['licenseClass'] }); setErrors((er) => ({ ...er, licenseClass: '' })); }}
                className={errors.licenseClass ? 'add-q__input--error' : ''}
              >
                <option value="">Chọn hạng</option>
                {LICENSE_CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              {errors.licenseClass && <span className="add-q__error">{errors.licenseClass}</span>}
            </div>

            <div className="add-q__form-group">
              <label>Chủ đề *</label>
              <select
                value={form.topic}
                onChange={(e) => { update({ topic: e.target.value }); setErrors((er) => ({ ...er, topic: '' })); }}
                className={errors.topic ? 'add-q__input--error' : ''}
              >
                <option value="">Chọn chủ đề</option>
                {TOPIC_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.topic && <span className="add-q__error">{errors.topic}</span>}
            </div>

            <div className="add-q__form-group">
              <label>Độ khó *</label>
              <div className="add-q__difficulty-group">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <label key={d} className={`add-q__difficulty-option ${form.difficulty === d ? 'add-q__difficulty-option--active' : ''}`}>
                    <input
                      type="radio"
                      name="difficulty"
                      value={d}
                      checked={form.difficulty === d}
                      onChange={() => { update({ difficulty: d }); setErrors((er) => ({ ...er, difficulty: '' })); }}
                    />
                    <span className={`add-q__difficulty-dot add-q__difficulty-dot--${d}`} />
                    {DIFFICULTY_LABELS[d]}
                  </label>
                ))}
              </div>
              {errors.difficulty && <span className="add-q__error">{errors.difficulty}</span>}
            </div>

            <label className="add-q__critical-label">
              <input
                type="checkbox"
                checked={form.isCritical}
                onChange={(e) => update({ isCritical: e.target.checked })}
              />
              <span>Câu hỏi điểm liệt</span>
            </label>
          </div>

          {/* Tags */}
          <div className="add-q__sidebar-card">
            <div className="add-q__sidebar-title">Tags</div>
            <div className="add-q__tag-input-row">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Thêm tag..."
              />
            </div>
            {form.tags.length > 0 && (
              <div className="add-q__tags">
                {form.tags.map((tag) => (
                  <span key={tag} className="add-q__tag">
                    {tag}
                    <button onClick={() => removeTag(tag)}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <button className="add-q__submit-btn" onClick={handleSubmit}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {isEdit ? 'Lưu Thay Đổi' : 'Tạo Mới'}
          </button>
          <button className="add-q__cancel-btn" onClick={() => navigate('/questions')}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
