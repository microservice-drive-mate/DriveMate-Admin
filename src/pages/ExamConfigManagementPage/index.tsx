import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { examService } from "@/services";
import type {
	ExamTemplate,
	LicenseCategory,
} from "@/types/exam-template.types";
import { LICENSE_CATEGORIES } from "@/types/exam-template.types";
import { EXAM_CONFIG_PAGE_SIZE } from "../../constants/pagination";
import "./ExamConfigManagementPage.css";

interface Filters {
	licenseCategory: LicenseCategory | "";
	isActive: "" | "true" | "false";
}

function ExamConfigCard({
	template,
	onEdit,
	onView,
	onDelete,
	deleting,
}: {
	template: ExamTemplate;
	onEdit: (id: string) => void;
	onView: (template: ExamTemplate) => void;
	onDelete: (template: ExamTemplate) => void;
	deleting: boolean;
}) {
	const statusKey = template.isActive ? "active" : "inactive";
	const statusLabel = template.isActive ? "Đang áp dụng" : "Ngừng áp dụng";

	return (
		<div className="ec-card">
			<div className="ec-card__top">
				<div className="ec-card__badge">{template.licenseCategory}</div>
				<div className="ec-card__info">
					<div className="ec-card__class-name">{template.name}</div>
					<span
						className={`ec-card__status ec-card__status--${statusKey}`}>
						{statusLabel}
					</span>
				</div>
			</div>

			<div className="ec-card__stats">
				<div className="ec-card__stat-row">
					<span className="ec-card__stat-label">Tổng số câu:</span>
					<span className="ec-card__stat-value">
						{template.totalQuestions} câu
					</span>
				</div>
				<div className="ec-card__stat-row">
					<span className="ec-card__stat-label">Điểm chuẩn:</span>
					<span className="ec-card__stat-value ec-card__stat-value--orange">
						{template.passingScore}/{template.totalQuestions}
					</span>
				</div>
				<div className="ec-card__stat-row">
					<span className="ec-card__stat-label">Thời gian:</span>
					<span className="ec-card__stat-value">
						{template.durationMinutes} phút
					</span>
				</div>
				<div className="ec-card__stat-row">
					<span className="ec-card__stat-label">Phiên bản:</span>
					<span className="ec-card__stat-value">
						v{template.version}
					</span>
				</div>
			</div>

			<div className="ec-card__actions">
				<button
					className="ec-card__btn-edit"
					onClick={() => onEdit(template.id)}>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2">
						<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
						<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
					</svg>
					Chỉnh Sửa
				</button>
				<button
					className="ec-card__btn-view"
					onClick={() => onView(template)}
					title="Xem chi tiết">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2">
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
						<polyline points="14 2 14 8 20 8" />
						<line
							x1="16"
							y1="13"
							x2="8"
							y2="13"
						/>
						<line
							x1="16"
							y1="17"
							x2="8"
							y2="17"
						/>
						<polyline points="10 9 9 9 8 9" />
					</svg>
				</button>
				<button
					className="ec-card__btn-view"
					onClick={() => onDelete(template)}
					disabled={deleting}
					title="Xóa">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2">
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
						<path d="M10 11v6M14 11v6" />
					</svg>
				</button>
			</div>
		</div>
	);
}

function DetailModal({
	template,
	onClose,
}: {
	template: ExamTemplate;
	onClose: () => void;
}) {
	const statusKey = template.isActive ? "active" : "inactive";
	const statusLabel = template.isActive ? "Đang áp dụng" : "Ngừng áp dụng";

	return (
		<div
			className="ec-modal-overlay"
			onClick={onClose}>
			<div
				className="ec-modal"
				onClick={(e) => e.stopPropagation()}>
				<div className="ec-modal__header">
					<div className="ec-modal__title-row">
						<div className="ec-modal__badge">
							{template.licenseCategory}
						</div>
						<div>
							<h2>{template.name}</h2>
							<span
								className={`ec-card__status ec-card__status--${statusKey}`}>
								{statusLabel}
							</span>
						</div>
					</div>
					<button
						className="ec-modal__close"
						onClick={onClose}>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2">
							<line
								x1="18"
								y1="6"
								x2="6"
								y2="18"
							/>
							<line
								x1="6"
								y1="6"
								x2="18"
								y2="18"
							/>
						</svg>
					</button>
				</div>

				<div className="ec-modal__section-title">Thông Tin Đề Thi</div>
				<div className="ec-modal__grid">
					<div className="ec-modal__item">
						<span className="ec-modal__item-label">
							Tổng số câu
						</span>
						<span className="ec-modal__item-value">
							{template.totalQuestions} câu
						</span>
					</div>
					<div className="ec-modal__item">
						<span className="ec-modal__item-label">Điểm chuẩn</span>
						<span className="ec-modal__item-value ec-modal__item-value--orange">
							{template.passingScore}/{template.totalQuestions}
						</span>
					</div>
					<div className="ec-modal__item">
						<span className="ec-modal__item-label">
							Thời gian làm bài
						</span>
						<span className="ec-modal__item-value">
							{template.durationMinutes} phút
						</span>
					</div>
					<div className="ec-modal__item">
						<span className="ec-modal__item-label">Phiên bản</span>
						<span className="ec-modal__item-value">
							v{template.version}
						</span>
					</div>
					<div className="ec-modal__item">
						<span className="ec-modal__item-label">Ngày tạo</span>
						<span className="ec-modal__item-value">
							{new Date(template.createdAt).toLocaleDateString(
								"vi-VN",
							)}
						</span>
					</div>
					<div className="ec-modal__item">
						<span className="ec-modal__item-label">
							Cập nhật cuối
						</span>
						<span className="ec-modal__item-value">
							{new Date(template.updatedAt).toLocaleDateString(
								"vi-VN",
							)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ExamConfigManagementPage() {
	const navigate = useNavigate();
	const [templates, setTemplates] = useState<ExamTemplate[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [selected, setSelected] = useState<ExamTemplate | null>(null);
	const [filters, setFilters] = useState<Filters>({
		licenseCategory: "",
		isActive: "",
	});

	const fetchTemplates = () => {
		setLoading(true);
		setError("");
		examService
			.list({
				page: 1,
				size: EXAM_CONFIG_PAGE_SIZE,
				licenseCategory: filters.licenseCategory || undefined,
				isActive:
					filters.isActive === ""
						? undefined
						: filters.isActive === "true",
			})
			.then((res) => {
				if (res.success) {
					setTemplates(res.data.items);
					setTotal(res.data.total);
				} else {
					setError(res.error);
					setTemplates([]);
				}
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchTemplates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters.licenseCategory, filters.isActive]);

	const handleDelete = async (template: ExamTemplate) => {
		if (
			!window.confirm(
				`Xóa đề thi "${template.name}"? Thao tác này soft delete, không thể hoàn tác qua UI.`,
			)
		)
			return;
		setDeletingId(template.id);
		const res = await examService.softDelete(template.id, template.version);
		setDeletingId(null);
		if (res.success) {
			fetchTemplates();
		} else {
			setError(res.error);
		}
	};

	const activeCount = templates.filter((t) => t.isActive).length;
	const inactiveCount = templates.filter((t) => !t.isActive).length;
	const hasActiveFilters = Boolean(
		filters.licenseCategory || filters.isActive,
	);

	return (
		<div className="ec-management">
			<div className="ec-management__header">
				<div>
					<h1>Cấu Hình Đề Thi</h1>
					<p>Quản lý template đề thi theo từng hạng bằng lái</p>
				</div>
				<button
					className="ec-management__add-btn"
					onClick={() => navigate("/exam-config/new")}>
					+ Thêm Đề Thi
				</button>
			</div>

			<div className="ec-info-card">
				<div className="ec-info-card__icon">
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2">
						<circle
							cx="12"
							cy="12"
							r="3"
						/>
						<path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
						<path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
					</svg>
				</div>
				<div>
					<div className="ec-info-card__title">Template Đề Thi</div>
					<p className="ec-info-card__desc">
						Mỗi template định nghĩa cấu trúc đề thi gồm: số câu hỏi,
						điểm chuẩn, thời gian. Khi học viên bắt đầu thi, hệ
						thống sẽ lấy ngẫu nhiên câu hỏi từ ngân hàng theo cấu
						hình.
					</p>
				</div>
			</div>

			<div className="ec-filters">
				<select
					className="ec-filters__select"
					aria-label="Lọc theo hạng bằng"
					value={filters.licenseCategory}
					onChange={(e) =>
						setFilters((f) => ({
							...f,
							licenseCategory: e.target.value as
								| LicenseCategory
								| "",
						}))
					}>
					<option value="">Tất cả hạng bằng</option>
					{LICENSE_CATEGORIES.map((cat) => (
						<option
							key={cat}
							value={cat}>
							{cat}
						</option>
					))}
				</select>
				<select
					className="ec-filters__select"
					aria-label="Lọc theo trạng thái"
					value={filters.isActive}
					onChange={(e) =>
						setFilters((f) => ({
							...f,
							isActive: e.target.value as Filters["isActive"],
						}))
					}>
					<option value="">Tất cả trạng thái</option>
					<option value="true">Đang áp dụng</option>
					<option value="false">Ngừng áp dụng</option>
				</select>
				<button
					className="ec-filters__clear"
					type="button"
					disabled={!hasActiveFilters}
					onClick={() =>
						setFilters({ licenseCategory: "", isActive: "" })
					}>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2">
						<path d="M3 12a9 9 0 1 0 3-6.7" />
						<path d="M3 4v6h6" />
					</svg>
					Xóa lọc
				</button>
			</div>

			{error && (
				<div style={{ color: "#ef4444", padding: 16 }}>
					Lỗi: {error}
				</div>
			)}

			{loading ? (
				<div style={{ padding: 24 }}>Đang tải...</div>
			) : templates.length === 0 ? (
				<div style={{ padding: 24, color: "#94a3b8" }}>
					Chưa có template đề thi nào. Nhấn "+ Thêm Đề Thi" để tạo
					mới.
				</div>
			) : (
				<div className="ec-cards-grid">
					{templates.map((template) => (
						<ExamConfigCard
							key={template.id}
							template={template}
							onEdit={(id) => navigate(`/exam-config/${id}/edit`)}
							onView={setSelected}
							onDelete={handleDelete}
							deleting={deletingId === template.id}
						/>
					))}
				</div>
			)}

			<div className="ec-stats-bar">
				<div className="ec-stats-bar__item">
					<div className="ec-stats-bar__icon ec-stats-bar__icon--yellow">
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
						</svg>
					</div>
					<div>
						<div className="ec-stats-bar__label">
							Template (trang)
						</div>
						<div className="ec-stats-bar__value">
							{total.toLocaleString("vi-VN")}
						</div>
					</div>
				</div>
				<div className="ec-stats-bar__item">
					<div className="ec-stats-bar__icon ec-stats-bar__icon--green">
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2">
							<circle
								cx="12"
								cy="12"
								r="3"
							/>
							<path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
						</svg>
					</div>
					<div>
						<div className="ec-stats-bar__label">Đang áp dụng</div>
						<div className="ec-stats-bar__value">{activeCount}</div>
					</div>
				</div>
				<div className="ec-stats-bar__item">
					<div className="ec-stats-bar__icon ec-stats-bar__icon--blue">
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
							<line
								x1="16"
								y1="13"
								x2="8"
								y2="13"
							/>
							<line
								x1="16"
								y1="17"
								x2="8"
								y2="17"
							/>
						</svg>
					</div>
					<div>
						<div className="ec-stats-bar__label">Ngừng áp dụng</div>
						<div className="ec-stats-bar__value">
							{inactiveCount}
						</div>
					</div>
				</div>
			</div>

			{selected && (
				<DetailModal
					template={selected}
					onClose={() => setSelected(null)}
				/>
			)}
		</div>
	);
}
