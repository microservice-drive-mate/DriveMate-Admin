import type { QuestionFilters, TopicResponse } from "@/types/question.types";
import {
	DIFFICULTY_OPTIONS,
	LICENSE_CATEGORY_OPTIONS,
	QUESTION_TYPE_OPTIONS,
} from "@/types/question.types";
import { FilterSelect } from "@/components/ui/FilterSelect";

interface FilterBarProps {
	filters: QuestionFilters;
	topics: TopicResponse[];
	onChange: (next: QuestionFilters) => void;
}

export function FilterBar({ filters, topics, onChange }: FilterBarProps) {
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

			<FilterSelect
				value={filters.licenseCategory}
				onChange={(v) => update({ licenseCategory: v as QuestionFilters["licenseCategory"] })}
				placeholder="Hạng bằng"
				options={LICENSE_CATEGORY_OPTIONS.map((cls) => ({ value: cls, label: cls }))}
			/>

			<FilterSelect
				value={filters.type}
				onChange={(v) => update({ type: v as QuestionFilters["type"] })}
				placeholder="Loại câu hỏi"
				options={QUESTION_TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
			/>

			<FilterSelect
				value={filters.topicId}
				onChange={(v) => update({ topicId: v })}
				placeholder="Chủ đề"
				options={topics.map((t) => ({ value: t.id, label: t.name }))}
			/>

			<FilterSelect
				value={filters.difficulty}
				onChange={(v) => update({ difficulty: v as QuestionFilters["difficulty"] })}
				placeholder="Độ khó"
				options={DIFFICULTY_OPTIONS.map((d) => ({ value: d.value, label: d.label }))}
			/>

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
