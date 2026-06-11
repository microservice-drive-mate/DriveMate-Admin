import { useCourseForm } from "./hooks/useCourseForm";
import { CourseBasicInfoSection } from "./components/CourseBasicInfoSection";
import { CourseRequirementSection } from "./components/CourseRequirementSection";
import { CoursePreviewSidebar } from "./components/CoursePreviewSidebar";
import "./AddCoursePage.css";

export default function AddCoursePage() {
	const {
		isEdit,
		form,
		update,
		updateReq,
		instructors,
		instructorSearch,
		setInstructorSearch,
		loading,
		submitError,
		errors,
		clearFieldError,
		handleSubmit,
		goBack,
		fetchLoading,
	} = useCourseForm();

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
					<button className="add-course__back" onClick={goBack}>
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
						<h1>{isEdit ? "Chỉnh Sửa Khóa Học" : "Thêm Khóa Học Mới"}</h1>
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
					<CourseBasicInfoSection
						form={form}
						isEdit={isEdit}
						errors={errors}
						onUpdate={update}
						onClearError={clearFieldError}
						instructors={instructors}
						instructorSearch={instructorSearch}
						onInstructorSearchChange={setInstructorSearch}
					/>
					<CourseRequirementSection
						requirement={form.requirement}
						onUpdate={updateReq}
					/>
				</div>

				<CoursePreviewSidebar
					form={form}
					loading={loading}
					isEdit={isEdit}
					onSubmit={handleSubmit}
					onCancel={goBack}
				/>
			</div>
		</div>
	);
}
