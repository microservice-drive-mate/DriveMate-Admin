import type { CourseResponse } from "@/types/course.types"
import { MaterialDownloadButton } from "./MaterialDownloadButton"

interface MaterialsTabProps {
	materials: CourseResponse["materials"]
	canManage: boolean
	onAdd: () => void
}

export function MaterialsTab({
	materials,
	canManage,
	onAdd,
}: MaterialsTabProps) {
	return (
		<div className="course-detail__section">
			<div className="course-detail__section-header course-detail__section-header--with-action">
				<span>Tài Liệu Học Tập</span>
				{canManage && (
					<button className="course-detail__add-btn" onClick={onAdd}>
						+ Thêm tài liệu
					</button>
				)}
			</div>
			{materials.length === 0 ? (
				<div className="course-detail__empty">
					Chưa có tài liệu nào.
				</div>
			) : (
				<div className="course-detail__material-list">
					{materials.map((material) => (
						<div
							key={material.id}
							className="course-detail__material-row"
						>
							<div className="course-detail__material-icon">
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
								>
									<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
									<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
								</svg>
							</div>
							<div className="course-detail__material-info">
								<div className="course-detail__material-name">
									{material.title}
								</div>
								{material.type && (
									<span className="course-detail__material-type">
										{material.type}
									</span>
								)}
							</div>
							<MaterialDownloadButton material={material} />
						</div>
					))}
				</div>
			)}
		</div>
	)
}
