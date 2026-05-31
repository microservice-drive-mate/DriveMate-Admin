import type { QuestionFilters, TopicResponse } from "@/types/question.types";
import {
	DIFFICULTY_OPTIONS,
	LICENSE_CATEGORY_OPTIONS,
	QUESTION_TYPE_OPTIONS,
} from "@/types/question.types";

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
					placeholder="TÃ¬m kiáº¿m cÃ¢u há»i..."
				/>
			</div>

			<select value={filters.licenseCategory} onChange={(e) => update({ licenseCategory: e.target.value as QuestionFilters["licenseCategory"] })}>
				<option value="">Háº¡ng báº±ng</option>
				{LICENSE_CATEGORY_OPTIONS.map((cls) => (
					<option key={cls} value={cls}>{cls}</option>
				))}
			</select>

			<select value={filters.type} onChange={(e) => update({ type: e.target.value as QuestionFilters["type"] })}>
				<option value="">Loáº¡i cÃ¢u há»i</option>
				{QUESTION_TYPE_OPTIONS.map((t) => (
					<option key={t.value} value={t.value}>{t.label}</option>
				))}
			</select>

			<select value={filters.topicId} onChange={(e) => update({ topicId: e.target.value })}>
				<option value="">Chá»§ Ä‘á»</option>
				{topics.map((t) => (
					<option key={t.id} value={t.id}>{t.name}</option>
				))}
			</select>

			<select value={filters.difficulty} onChange={(e) => update({ difficulty: e.target.value as QuestionFilters["difficulty"] })}>
				<option value="">Äá»™ khÃ³</option>
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
				<span>Hiá»‡n Ä‘Ã£ xÃ³a</span>
			</label>
		</div>
	);
}
