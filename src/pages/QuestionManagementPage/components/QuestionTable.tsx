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
						<tr key={q.id} className={q.isDeleted ? "q-table__row--deleted" : ""}>
							<td className="q-table__content">
								<div className="q-table__content-main">
									<span className="q-table__content-text" title={q.content}>
										{q.content}
									</span>
									{q.isCritical && (
										<span
											className="q-critical-icon"
											role="img"
											aria-label="Câu điểm liệt"
											title="Câu điểm liệt">
											<svg
												width="14"
												height="14"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2.25"
												strokeLinecap="round"
												strokeLinejoin="round"
												aria-hidden="true">
												<path d="M12 9v4" />
												<path d="M12 17h.01" />
												<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
											</svg>
										</span>
									)}
								</div>
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
