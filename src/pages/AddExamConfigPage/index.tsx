import { useExamConfigForm } from "./hooks/useExamConfigForm"
import { ExamBasicInfoSection } from "./components/ExamBasicInfoSection"
import { ExamQuestionConfigSection } from "./components/ExamQuestionConfigSection"
import { TopicDistributionEditor } from "./components/TopicDistributionEditor"
import { ExamSettingsSection } from "./components/ExamSettingsSection"
import { ExamConfigPreviewSidebar } from "./components/ExamConfigPreviewSidebar"
import "./AddExamConfigPage.css"

export default function AddExamConfigPage() {
	const {
		isEdit,
		form,
		version,
		errors,
		submitting,
		submitError,
		topics,
		updateForm,
		handleLicenseChange,
		addTopicRow,
		removeTopicRow,
		updateTopicRow,
		topicDistributionTotal,
		handleSubmit,
		goBack,
		previewClass,
		fetchLoading,
	} = useExamConfigForm()

	if (fetchLoading) {
		return <div style={{ padding: 24 }}>Đang tải...</div>
	}

	return (
		<div className="add-ec">
			<div className="add-ec__header">
				<div className="add-ec__header-left">
					<button className="add-ec__back" onClick={goBack}>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
						>
							<path d="M19 12H5M12 5l-7 7 7 7" />
						</svg>
					</button>
					<div>
						<h1>
							{isEdit ? "Chỉnh Sửa Đề Thi" : "Thêm Đề Thi Mới"}
						</h1>
						<p>
							{isEdit
								? "Cập nhật template đề thi"
								: "Tạo template đề thi mới"}
						</p>
					</div>
				</div>
			</div>

			{submitError && (
				<div style={{ color: "#ef4444", padding: "12px 16px" }}>
					Lỗi: {submitError}
				</div>
			)}

			<div className="add-ec__body">
				<div className="add-ec__main">
					<ExamBasicInfoSection
						form={form}
						isEdit={isEdit}
						errors={errors}
						onUpdate={updateForm}
						onLicenseChange={handleLicenseChange}
					/>
					<ExamQuestionConfigSection
						form={form}
						errors={errors}
						onUpdate={updateForm}
					/>
					<TopicDistributionEditor
						rows={form.topicDistribution}
						totalQuestions={form.totalQuestions}
						total={topicDistributionTotal}
						topics={topics}
						error={errors.topicDistribution}
						onAdd={addTopicRow}
						onRemove={removeTopicRow}
						onUpdateRow={updateTopicRow}
					/>
					<ExamSettingsSection
						form={form}
						isEdit={isEdit}
						errors={errors}
						onUpdate={updateForm}
					/>
				</div>

				<ExamConfigPreviewSidebar
					form={form}
					isEdit={isEdit}
					version={version}
					previewClass={previewClass}
					submitting={submitting}
					onSubmit={handleSubmit}
					onCancel={goBack}
				/>
			</div>
		</div>
	)
}
