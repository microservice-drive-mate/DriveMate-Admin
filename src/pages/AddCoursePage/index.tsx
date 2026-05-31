import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { courseService, identityService } from "@/services";
import type { IdentityUser } from "@/types/identity.types";
import {
	getCourseDetailErrorMessage,
	getCreateCourseErrorMessage,
	getCreateCourseSuccessMessage,
	getUpdateCourseErrorMessage,
	getUpdateCourseSuccessMessage,
	SRS_MESSAGES,
} from "@/utils/srsMessages";
import type { CourseFormData, LicenseCategory } from "../../types/course.types";
import { COURSE_LICENSE_CATEGORIES } from "../../types/course.types";
import "./AddCoursePage.css";

const DEFAULT_FORM: CourseFormData = {
	title: "",
	licenseCategory: "",
	description: "",
	duration: "",
	tuitionFee: 0,
	capacity: 30,
	instructorIds: [],
	requirement: {
		minAge: 18,
		prerequisites: "",
		attendanceRate: 80,
		minPassScore: 80,
		requiredExams: 2,
	},
};

export default function AddCoursePage() {
	const { courseId } = useParams<{ courseId: string }>();
	const navigate = useNavigate();
	const isEdit = Boolean(courseId);

	const [form, setForm] = useState<CourseFormData>(DEFAULT_FORM);
	const [instructors, setInstructors] = useState<IdentityUser[]>([]);
	const [instructorSearch, setInstructorSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadedCourseId, setLoadedCourseId] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState("");
	const [errors, setErrors] = useState<
		Partial<Record<"title" | "licenseCategory", string>>
	>({});

	useEffect(() => {
		if (!isEdit || !courseId) return;
		courseService.getById(courseId).then((res) => {
			setLoadedCourseId(courseId);
			if (res.success) {
				const c = res.data;
				setForm({
					title: c.title,
					licenseCategory: c.licenseCategory,
					description: c.description ?? "",
					duration: c.duration ?? "",
					tuitionFee: c.tuitionFee,
					capacity: c.capacity ?? 30,
					instructorIds: c.instructorIds ?? [],
					requirement: {
						minAge: c.requirement?.minAge ?? 18,
						prerequisites: c.requirement?.prerequisites ?? "",
						attendanceRate: c.requirement?.attendanceRate ?? 80,
						minPassScore: c.requirement?.minPassScore ?? 80,
						requiredExams: c.requirement?.requiredExams ?? 2,
					},
				});
			} else {
				setSubmitError(getCourseDetailErrorMessage(res));
			}
		});
	}, [isEdit, courseId]);

	useEffect(() => {
		identityService.list({ role: "INSTRUCTOR", size: 100 }).then((res) => {
			if (res.success) setInstructors(res.data.items);
		});
	}, []);

	const update = (patch: Partial<CourseFormData>) =>
		setForm((f) => ({ ...f, ...patch }));
	const updateReq = (patch: Partial<CourseFormData["requirement"]>) =>
		setForm((f) => ({ ...f, requirement: { ...f.requirement, ...patch } }));

	const validate = (): boolean => {
		const errs: typeof errors = {};
		if (!form.title.trim()) errs.title = SRS_MESSAGES.MSG25;
		if (!form.licenseCategory) errs.licenseCategory = SRS_MESSAGES.MSG25;
		setErrors(errs);
		return Object.keys(errs).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		setLoading(true);
		setSubmitError("");

		const req = {
			minAge: form.requirement.minAge || undefined,
			prerequisites: form.requirement.prerequisites.trim() || undefined,
			attendanceRate: form.requirement.attendanceRate,
			minPassScore: form.requirement.minPassScore,
			requiredExams: form.requirement.requiredExams,
		};

		const result =
			isEdit && courseId
				? await courseService.update(courseId, {
						title: form.title.trim(),
						description: form.description.trim() || undefined,
						duration: form.duration.trim() || undefined,
						tuitionFee: form.tuitionFee,
						capacity: form.capacity || undefined,
						requirement: req,
					})
				: await courseService.create({
						title: form.title.trim(),
						licenseCategory:
							form.licenseCategory as LicenseCategory,
						description: form.description.trim() || undefined,
						duration: form.duration.trim() || undefined,
						tuitionFee: form.tuitionFee,
						capacity: form.capacity || undefined,
						instructorIds:
							form.instructorIds.length > 0
								? form.instructorIds
								: undefined,
						requirement: req,
					});

		console.log(result);

		setLoading(false);

		if (result.success) {
			navigate(
				isEdit && courseId
					? `/courses/${courseId}`
					: `/courses/${result.data.id}`,
				{
					state: {
						notice: isEdit
							? getUpdateCourseSuccessMessage()
							: getCreateCourseSuccessMessage(),
					},
				},
			);
		} else {
			setSubmitError(
				isEdit
					? getUpdateCourseErrorMessage(result)
					: getCreateCourseErrorMessage(result),
			);
		}
	};

	const fetchLoading =
		isEdit && Boolean(courseId) && loadedCourseId !== courseId;

	if (fetchLoading) {
		return (
			<div className="add-course">
				<div className="add-course__loading">Đang tải...</div>
			</div>
		);
	}

	return (
		<div className="add-course">
			<div className="add-course__header">
				<div className="add-course__header-left">
					<button
						className="add-course__back"
						onClick={() =>
							navigate(
								isEdit ? `/courses/${courseId}` : "/courses",
							)
						}>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5">
							<path d="M19 12H5M12 5l-7 7 7 7" />
						</svg>
					</button>
					<div>
						<h1>
							{isEdit
								? "Chỉnh Sửa Khóa Học"
								: "Thêm Khóa Học Mới"}
						</h1>
						<p>
							{isEdit
								? "Cập nhật thông tin khóa học"
								: "Tạo khóa học mới cho hệ thống"}
						</p>
					</div>
				</div>
			</div>

			{submitError && (
				<div className="add-course__submit-error">{submitError}</div>
			)}

			<div className="add-course__body">
				<div className="add-course__main">
					{/* Thông Tin Cơ Bản */}
					<div className="add-course__section">
						<div className="add-course__section-title">
							Thông Tin Cơ Bản
						</div>
						<div className="add-course__form-body">
							<div className="add-course__form-group">
								<label>Tên khóa học *</label>
								<input
									value={form.title}
									onChange={(e) => {
										update({ title: e.target.value });
										setErrors((er) => ({
											...er,
											title: "",
										}));
									}}
									placeholder="VD: Khóa học B2 cơ bản"
									className={
										errors.title
											? "add-course__input--error"
											: ""
									}
								/>
								{errors.title && (
									<span className="add-course__error">
										{errors.title}
									</span>
								)}
							</div>

							<div className="add-course__form-row">
								<div className="add-course__form-group">
									<label>Hạng bằng *</label>
									<select
										value={form.licenseCategory}
										onChange={(e) => {
											update({
												licenseCategory: e.target
													.value as
													| LicenseCategory
													| "",
											});
											setErrors((er) => ({
												...er,
												licenseCategory: "",
											}));
										}}
										disabled={isEdit}
										className={
											errors.licenseCategory
												? "add-course__input--error"
												: ""
										}>
										<option value="">Chọn hạng bằng</option>
										{COURSE_LICENSE_CATEGORIES.map(
											(cls) => (
												<option
													key={cls}
													value={cls}>
													{cls}
												</option>
											),
										)}
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
										onChange={(e) =>
											update({ duration: e.target.value })
										}
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
											update({
												tuitionFee: Number(
													e.target.value,
												),
											})
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
											update({
												capacity: Number(
													e.target.value,
												),
											})
										}
									/>
								</div>
							</div>

							<div className="add-course__form-group">
								<label>Mô tả khóa học</label>
								<textarea
									value={form.description}
									onChange={(e) =>
										update({ description: e.target.value })
									}
									placeholder="Mô tả chi tiết về khóa học..."
									rows={4}
								/>
							</div>

							<div className="add-course__form-group">
								<label>Giảng viên phụ trách</label>
								{isEdit ? (
									<div className="add-course__instructor-tags">
										{form.instructorIds.length === 0 ? (
											<span className="add-course__hint">
												Không có giảng viên nào được
												gán.
											</span>
										) : (
											form.instructorIds.map((id) => {
												const found = instructors.find(
													(i) => i.userId === id,
												);
												return (
													<span
														key={id}
														className="add-course__instructor-tag">
														{found
															? found.fullName
															: id.slice(0, 8)}
													</span>
												);
											})
										)}
									</div>
								) : (
									<>
										<input
											className="add-course__instructor-search"
											placeholder="Tìm theo tên hoặc email..."
											value={instructorSearch}
											onChange={(e) =>
												setInstructorSearch(
													e.target.value,
												)
											}
										/>
										<div className="add-course__instructor-list">
											{instructors
												.filter((i) => {
													const q =
														instructorSearch.toLowerCase();
													return (
														!q ||
														i.fullName
															.toLowerCase()
															.includes(q) ||
														i.email
															.toLowerCase()
															.includes(q)
													);
												})
												.map((i) => (
													<label
														key={i.userId}
														className="add-course__instructor-option">
														<input
															type="checkbox"
															checked={form.instructorIds.includes(
																i.userId,
															)}
															onChange={(e) => {
																const next = e
																	.target
																	.checked
																	? [
																			...form.instructorIds,
																			i.userId,
																		]
																	: form.instructorIds.filter(
																			(
																				id,
																			) =>
																				id !==
																				i.userId,
																		);
																update({
																	instructorIds:
																		next,
																});
															}}
														/>
														<span className="add-course__instructor-name">
															{i.fullName}
														</span>
														<span className="add-course__instructor-email">
															{i.email}
														</span>
													</label>
												))}
											{instructors.length === 0 && (
												<span className="add-course__hint">
													Đang tải danh sách giảng
													viên...
												</span>
											)}
										</div>
									</>
								)}
							</div>
						</div>
					</div>

					{/* Yêu Cầu */}
					<div className="add-course__section">
						<div className="add-course__section-title">
							Yêu Cầu Học Viên
						</div>
						<div className="add-course__form-body">
							<div className="add-course__form-row">
								<div className="add-course__form-group">
									<label>Độ tuổi tối thiểu</label>
									<input
										type="number"
										min={0}
										value={form.requirement.minAge}
										onChange={(e) =>
											updateReq({
												minAge: Number(e.target.value),
											})
										}
									/>
								</div>
								<div className="add-course__form-group">
									<label>Số bài thi yêu cầu</label>
									<input
										type="number"
										min={0}
										value={form.requirement.requiredExams}
										onChange={(e) =>
											updateReq({
												requiredExams: Number(
													e.target.value,
												),
											})
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
										value={form.requirement.attendanceRate}
										onChange={(e) =>
											updateReq({
												attendanceRate: Number(
													e.target.value,
												),
											})
										}
									/>
								</div>
								<div className="add-course__form-group">
									<label>Điểm đạt tối thiểu (%)</label>
									<input
										type="number"
										min={0}
										max={100}
										value={form.requirement.minPassScore}
										onChange={(e) =>
											updateReq({
												minPassScore: Number(
													e.target.value,
												),
											})
										}
									/>
								</div>
							</div>
							<div className="add-course__form-group">
								<label>Điều kiện tiên quyết</label>
								<textarea
									value={form.requirement.prerequisites}
									onChange={(e) =>
										updateReq({
											prerequisites: e.target.value,
										})
									}
									placeholder="VD: Đã có GPLX hạng A1..."
									rows={2}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Sidebar */}
				<div className="add-course__sidebar">
					<div className="add-course__sidebar-card">
						<div className="add-course__sidebar-title">
							Xem Trước
						</div>
						<div className="add-course__preview-badge">
							{form.licenseCategory || "—"}
						</div>
						<div className="add-course__preview-title">
							{form.title || "Tên khóa học"}
						</div>
						<div className="add-course__preview-stats">
							<div className="add-course__preview-stat">
								<span>Thời lượng:</span>
								<span>{form.duration || "—"}</span>
							</div>
							<div className="add-course__preview-stat">
								<span>Học phí:</span>
								<span>
									{form.tuitionFee.toLocaleString("vi-VN")}đ
								</span>
							</div>
							<div className="add-course__preview-stat">
								<span>Sức chứa:</span>
								<span>{form.capacity} học viên</span>
							</div>
						</div>
					</div>

					<button
						className="add-course__submit-btn"
						onClick={handleSubmit}
						disabled={loading}>
						<svg
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2">
							<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
							<polyline points="17 21 17 13 7 13 7 21" />
							<polyline points="7 3 7 8 15 8" />
						</svg>
						{loading
							? "Đang lưu..."
							: isEdit
								? "Lưu Thay Đổi"
								: "Tạo Mới"}
					</button>
					<button
						className="add-course__cancel-btn"
						onClick={() =>
							navigate(
								isEdit ? `/courses/${courseId}` : "/courses",
							)
						}
						disabled={loading}>
						Hủy
					</button>
				</div>
			</div>
		</div>
	);
}
