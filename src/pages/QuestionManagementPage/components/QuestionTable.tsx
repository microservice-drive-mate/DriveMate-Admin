import type {
	QuestionDifficulty,
	QuestionResponse,
	TopicResponse,
} from "@/types/question.types";
import {
	DIFFICULTY_LABELS,
	QUESTION_TYPE_LABELS,
} from "@/types/question.types";
import { ActionMenu } from "./ActionMenu";
import { LicenseCategoryBadges } from "./LicenseCategoryBadges";

const DIFFICULTY_CLASS: Record<QuestionDifficulty, string> = {
	EASY: "q-badge--easy",
	MEDIUM: "q-badge--medium",
	HARD: "q-badge--hard",
};

interface QuestionTableProps {
	questions: QuestionResponse[];
	topics: TopicResponse[];
	loading: boolean;
	onEdit: (id: string) => void;
	onDelete: (id: string, version: number) => void;
}

export function QuestionTable({
	questions,
	topics,
	loading,
	onEdit,
	onDelete,
}: QuestionTableProps) {
	const topicMap = Object.fromEntries(topics.map((t) => [t.id, t.name]));

	if (loading) return <div className="q-empty">Äang táº£i...</div>;
	if (!questions.length) return <div className="q-empty">KhÃ´ng tÃ¬m tháº¥y cÃ¢u há»i nÃ o.</div>;

	return (
		<div className="q-table-wrap">
			<table className="q-table">
				<thead>
					<tr>
						<th>Ná»™i Dung</th>
						<th>Loáº¡i</th>
						<th>Háº¡ng</th>
						<th>Chá»§ Äá»</th>
						<th>Äá»™ KhÃ³</th>
						<th>Tráº¡ng thÃ¡i</th>
						<th>Version</th>
						<th>Thao TÃ¡c</th>
					</tr>
				</thead>
				<tbody>
					{questions.map((q) => (
						<tr key={q.id} className={q.isDeleted ? "q-table__row--deleted" : ""}>
							<td className="q-table__content">
								<span title={q.content}>{q.content}</span>
								{q.isCritical && <span className="q-type-badge q-type-badge--critical">Liá»‡t</span>}
							</td>
							<td>
								<span className="q-type-badge">{QUESTION_TYPE_LABELS[q.type]}</span>
							</td>
							<td>
								<LicenseCategoryBadges categories={q.licenseCategories} />
							</td>
							<td className="q-table__topic">{topicMap[q.topicId] ?? q.topicId}</td>
							<td>
								<span className={`q-badge ${DIFFICULTY_CLASS[q.difficulty]}`}>
									{DIFFICULTY_LABELS[q.difficulty]}
								</span>
							</td>
							<td>
								{q.isDeleted ? (
									<span className="q-status q-status--deleted">ÄÃ£ xÃ³a</span>
								) : q.isActive ? (
									<span className="q-status q-status--active">Hoáº¡t Ä‘á»™ng</span>
								) : (
									<span className="q-status q-status--inactive">Táº¡m dá»«ng</span>
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
