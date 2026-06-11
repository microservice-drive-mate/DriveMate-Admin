import type { IdentityUser } from "@/types/identity.types";
import type { CourseFormData, LicenseCategory } from "@/types/course.types";
import { COURSE_LICENSE_CATEGORIES } from "@/types/course.types";
import { InstructorPicker } from "./InstructorPicker";

type FieldErrors = Partial<Record<"title" | "licenseCategory", string>>;

interface CourseBasicInfoSectionProps {
	form: CourseFormData;
	isEdit: boolean;
	errors: FieldErrors;
	onUpdate: (patch: Partial<CourseFormData>) => void;
	onClearError: (field: "title" | "licenseCategory") => void;
	instructors: IdentityUser[];
	instructorSearch: string;
	onInstructorSearchChange: (next: string) => void;
}

export function CourseBasicInfoSection({
	form,
	isEdit,
	errors,
	onUpdate,
	onClearError,
	instructors,
	instructorSearch,
	onInstructorSearchChange,
}: CourseBasicInfoSectionProps) {
	return (
		<div className="add-course__section">
			<div className="add-course__section-title">Thông Tin Cơ Bản</div>
			<div className="add-course__form-body">
				<div className="add-course__form-group">
					<label>Tên khóa học *</label>
					<input
						value={form.title}
						onChange={(e) => {
							onUpdate({ title: e.target.value });
							onClearError("title");
						}}
						placeholder="VD: Khóa học B2 cơ bản"
						className={errors.title ? "add-course__input--error" : ""}
					/>
					{errors.title && (
						<span className="add-course__error">{errors.title}</span>
					)}
				</div>

				<div className="add-course__form-row">
					<div className="add-course__form-group">
						<label>Hạng bằng *</label>
						<select
							value={form.licenseCategory}
							onChange={(e) => {
								onUpdate({
									licenseCategory: e.target.value as
										| LicenseCategory
										| "",
								});
								onClearError("licenseCategory");
							}}
							disabled={isEdit}
							className={
								errors.licenseCategory
									? "add-course__input--error"
									: ""
							}>
							<option value="">Chọn hạng bằng</option>
							{COURSE_LICENSE_CATEGORIES.map((cls) => (
								<option key={cls} value={cls}>
									{cls}
								</option>
							))}
						</select>
						{isEdit && (
							<span className="add-course__hint">
								Không thể thay đổi sau khi tạo
							</span>
						)}
						{errors.licenseCategory && (
							<span className="add-course__error">
								{errors.licenseCategory}
							</span>
						)}
					</div>
					<div className="add-course__form-group">
						<label>Thời lượng</label>
						<input
							value={form.duration}
							onChange={(e) => onUpdate({ duration: e.target.value })}
							placeholder="VD: 3 tháng"
						/>
					</div>
				</div>

				<div className="add-course__form-row">
					<div className="add-course__form-group">
						<label>Học phí (đồng)</label>
						<input
							type="number"
							min={0}
							value={form.tuitionFee}
							onChange={(e) =>
								onUpdate({ tuitionFee: Number(e.target.value) })
							}
						/>
					</div>
					<div className="add-course__form-group">
						<label>Sức chứa (học viên)</label>
						<input
							type="number"
							min={1}
							value={form.capacity}
							onChange={(e) =>
								onUpdate({ capacity: Number(e.target.value) })
							}
						/>
					</div>
				</div>

				<div className="add-course__form-group">
					<label>Mô tả khóa học</label>
					<textarea
						value={form.description}
						onChange={(e) => onUpdate({ description: e.target.value })}
						placeholder="Mô tả chi tiết về khóa học..."
						rows={4}
					/>
				</div>

				<div className="add-course__form-group">
					<label>Giảng viên phụ trách</label>
					<InstructorPicker
						isEdit={isEdit}
						instructors={instructors}
						value={form.instructorIds}
						onChange={(next) => onUpdate({ instructorIds: next })}
						search={instructorSearch}
						onSearchChange={onInstructorSearchChange}
					/>
				</div>
			</div>
		</div>
	);
}
