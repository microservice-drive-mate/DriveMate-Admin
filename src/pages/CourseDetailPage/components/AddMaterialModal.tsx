import { useState } from "react"
import { courseService } from "@/services"
import { FileUploader } from "@/components/common/FileUploader"
import type { CourseResponse } from "@/types/course.types"
import type { MediaReference } from "@/types/media.types"

interface MaterialUpload extends MediaReference {
	originalName?: string
	fileSize?: number
	mimeType?: string
}

interface AddMaterialModalProps {
	courseId: string
	onClose: () => void
	onSaved: (course: CourseResponse) => void
}

export function AddMaterialModal({
	courseId,
	onClose,
	onSaved,
}: AddMaterialModalProps) {
	const [form, setForm] = useState<{
		title: string
		type: string
		file: MaterialUpload | null
	}>({ title: "", type: "", file: null })
	const [error, setError] = useState("")
	const [saving, setSaving] = useState(false)

	const handleSave = async () => {
		if (!form.title.trim()) {
			setError("Vui lòng nhập tên tài liệu")
			return
		}
		if (!form.file) {
			setError("Vui lòng tải lên tệp tài liệu")
			return
		}
		setSaving(true)
		setError("")
		const res = await courseService.addMaterial(courseId, {
			title: form.title.trim(),
			fileUrl: form.file.publicUrl,
			mediaFileId: form.file.mediaFileId,
			type: form.type.trim() || undefined,
		})
		setSaving(false)
		if (res.success) {
			onSaved(res.data)
		} else {
			setError(res.error)
		}
	}

	return (
		<div
			className="course-detail__modal-overlay"
			onClick={() => !saving && onClose()}
		>
			<div
				className="course-detail__modal"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="course-detail__modal-header">
					Thêm tài liệu mới
				</div>
				<div className="course-detail__modal-body">
					<div className="course-detail__form-group">
						<label>Tên tài liệu *</label>
						<input
							value={form.title}
							onChange={(e) =>
								setForm((f) => ({
									...f,
									title: e.target.value,
								}))
							}
							placeholder="VD: Giáo trình lý thuyết B2"
							disabled={saving}
						/>
					</div>
					<div className="course-detail__form-group">
						<label>Tệp tài liệu *</label>
						<FileUploader
							value={form.file}
							onChange={(next) =>
								setForm((f) => ({ ...f, file: next }))
							}
							disabled={saving}
							label="Bấm hoặc kéo thả tệp vào đây"
						/>
					</div>
					<div className="course-detail__form-group">
						<label>Loại tài liệu</label>
						<input
							value={form.type}
							onChange={(e) =>
								setForm((f) => ({ ...f, type: e.target.value }))
							}
							placeholder="VD: PDF, video, slide"
							disabled={saving}
						/>
					</div>
					{error && (
						<div className="course-detail__form-error">{error}</div>
					)}
				</div>
				<div className="course-detail__modal-footer">
					<button
						className="course-detail__modal-cancel"
						onClick={onClose}
						disabled={saving}
					>
						Hủy
					</button>
					<button
						className="course-detail__modal-save"
						onClick={handleSave}
						disabled={saving}
					>
						{saving ? "Đang lưu..." : "Lưu"}
					</button>
				</div>
			</div>
		</div>
	)
}
