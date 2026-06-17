import { useState } from "react"
import { topicService } from "@/services"
import type { TopicResponse } from "../../../types/question.types"

const EMPTY_TOPIC_FORM = { name: "", description: "", parentId: "" }

interface TopicModalProps {
	topics: TopicResponse[]
	onClose: () => void
	onTopicsChanged: () => void
}

export function TopicModal({
	topics,
	onClose,
	onTopicsChanged,
}: TopicModalProps) {
	const [topicForm, setTopicForm] = useState(EMPTY_TOPIC_FORM)
	const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleOpenEdit = (topic: TopicResponse) => {
		setEditingTopicId(topic.id)
		setTopicForm({
			name: topic.name,
			description: topic.description ?? "",
			parentId: topic.parentId ?? "",
		})
		setError(null)
	}

	const handleReset = () => {
		setEditingTopicId(null)
		setTopicForm(EMPTY_TOPIC_FORM)
		setError(null)
	}

	const handleSave = async () => {
		if (!topicForm.name.trim()) {
			setError("Tên topic không được để trống.")
			return
		}
		setLoading(true)
		setError(null)
		const payload = {
			name: topicForm.name.trim(),
			description: topicForm.description.trim() || undefined,
			parentId: topicForm.parentId || null,
		}
		const result = editingTopicId
			? await topicService.update(editingTopicId, payload)
			: await topicService.create(payload)
		setLoading(false)
		if (!result.success) {
			setError(result.error)
			return
		}
		handleReset()
		onTopicsChanged()
	}

	return (
		<div className="q-topic-modal">
			<div className="q-topic-modal__box">
				<div className="q-topic-modal__header">
					<span>
						{editingTopicId ? "Sửa Topic" : "Quản Lý Topic"}
					</span>
					<button className="q-topic-modal__close" onClick={onClose}>
						×
					</button>
				</div>

				<div className="q-topic-modal__form">
					<p className="q-topic-modal__form-title">
						{editingTopicId ? "Cập nhật topic" : "Thêm topic mới"}
					</p>
					{error && (
						<div className="q-topic-modal__error">{error}</div>
					)}
					<div className="q-topic-modal__field">
						<label>Tên topic *</label>
						<input
							value={topicForm.name}
							onChange={(e) =>
								setTopicForm((f) => ({
									...f,
									name: e.target.value,
								}))
							}
							placeholder="VD: BiỒn báo giao thông"
						/>
					</div>
					<div className="q-topic-modal__field">
						<label>Mô tả</label>
						<input
							value={topicForm.description}
							onChange={(e) =>
								setTopicForm((f) => ({
									...f,
									description: e.target.value,
								}))
							}
							placeholder="Mô tả ngắn (tùy chọn)"
						/>
					</div>
					<div className="q-topic-modal__field">
						<label>Topic cha</label>
						<select
							value={topicForm.parentId}
							onChange={(e) =>
								setTopicForm((f) => ({
									...f,
									parentId: e.target.value,
								}))
							}
						>
							<option value="">Không có</option>
							{topics
								.filter((t) => t.id !== editingTopicId)
								.map((t) => (
									<option key={t.id} value={t.id}>
										{t.name}
									</option>
								))}
						</select>
					</div>
					<div className="q-topic-modal__form-actions">
						<button
							className="q-topic-modal__btn q-topic-modal__btn--primary"
							onClick={handleSave}
							disabled={loading}
						>
							{loading
								? "Đang lưu..."
								: editingTopicId
									? "Cập nhật"
									: "Thêm"}
						</button>
						{editingTopicId && (
							<button
								className="q-topic-modal__btn"
								onClick={handleReset}
								disabled={loading}
							>
								Hủy sửa
							</button>
						)}
					</div>
				</div>

				<div className="q-topic-modal__list">
					<p className="q-topic-modal__list-title">
						Danh sách topic ({topics.length})
					</p>
					{topics.length === 0 ? (
						<p className="q-topic-modal__empty">
							Chưa có topic nào.
						</p>
					) : (
						topics.map((t) => (
							<div
								key={t.id}
								className={`q-topic-modal__row${editingTopicId === t.id ? " q-topic-modal__row--editing" : ""}`}
							>
								<div className="q-topic-modal__row-info">
									<span className="q-topic-modal__row-name">
										{t.name}
									</span>
									{t.description && (
										<span className="q-topic-modal__row-desc">
											{t.description}
										</span>
									)}
								</div>
								<button
									className="q-topic-modal__edit-btn"
									onClick={() => handleOpenEdit(t)}
									disabled={loading}
								>
									Sửa
								</button>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	)
}
