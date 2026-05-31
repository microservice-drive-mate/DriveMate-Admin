import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { examService } from "@/services";
import type {
	ExamTemplate,
	LicenseCategory,
} from "@/types/exam-template.types";
import { LICENSE_CATEGORIES } from "@/types/exam-template.types";
import { EXAM_CONFIG_PAGE_SIZE } from "../../constants/pagination";
import { DetailModal } from "./components/DetailModal";
import { ExamConfigCard } from "./components/ExamConfigCard";
import "./ExamConfigManagementPage.css";

interface Filters {
	licenseCategory: LicenseCategory | "";
	isActive: "" | "true" | "false";
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
