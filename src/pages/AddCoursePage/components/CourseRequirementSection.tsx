import type { CourseFormData } from "@/types/course.types";

interface CourseRequirementSectionProps {
	requirement: CourseFormData["requirement"];
	onUpdate: (patch: Partial<CourseFormData["requirement"]>) => void;
}

export function CourseRequirementSection({
	requirement,
	onUpdate,
}: CourseRequirementSectionProps) {
	return (
		<div className="add-course__section">
			<div className="add-course__section-title">Yêu Cầu Học Viên</div>
			<div className="add-course__form-body">
				<div className="add-course__form-row">
					<div className="add-course__form-group">
						<label>Độ tuổi tối thiểu</label>
						<input
							type="number"
							min={0}
							value={requirement.minAge}
							onChange={(e) =>
								onUpdate({ minAge: Number(e.target.value) })
							}
						/>
					</div>
					<div className="add-course__form-group">
						<label>Số bài thi yêu cầu</label>
						<input
							type="number"
							min={0}
							value={requirement.requiredExams}
							onChange={(e) =>
								onUpdate({ requiredExams: Number(e.target.value) })
							}
						/>
					</div>
				</div>
				<div className="add-course__form-row">
					<div className="add-course__form-group">
						<label>Tỷ lệ tham dự (%)</label>
						<input
							type="number"
							min={0}
							max={100}
							value={requirement.attendanceRate}
							onChange={(e) =>
								onUpdate({ attendanceRate: Number(e.target.value) })
							}
						/>
					</div>
					<div className="add-course__form-group">
						<label>Điểm đạt tối thiểu (%)</label>
						<input
							type="number"
							min={0}
							max={100}
							value={requirement.minPassScore}
							onChange={(e) =>
								onUpdate({ minPassScore: Number(e.target.value) })
							}
						/>
					</div>
				</div>
				<div className="add-course__form-group">
					<label>Điều kiện tiên quyết</label>
					<textarea
						value={requirement.prerequisites}
						onChange={(e) =>
							onUpdate({ prerequisites: e.target.value })
						}
						placeholder="VD: Đã có GPLX hạng A1..."
						rows={2}
					/>
				</div>
			</div>
		</div>
	);
}
