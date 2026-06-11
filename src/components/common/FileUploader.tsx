import {
	ALLOWED_AUDIO_MIMES,
	ALLOWED_DOCUMENT_MIMES,
	ALLOWED_VIDEO_MIMES,
	MAX_FILE_SIZE_BYTES,
	formatFileSize,
} from "@/constants/media";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { MediaReference, UploadResult } from "@/types/media.types";

import "./FileUploader.css";

interface FileUploaderValue extends MediaReference {
	originalName?: string;
	fileSize?: number;
	mimeType?: string;
}

interface FileUploaderProps {
	value: FileUploaderValue | null;
	onChange: (next: (FileUploaderValue & UploadResult) | null) => void;
	disabled?: boolean;
	maxSize?: number;
	accept?: readonly string[];
	label?: string;
}

const DEFAULT_ACCEPT = [
	...ALLOWED_DOCUMENT_MIMES,
	...ALLOWED_VIDEO_MIMES,
	...ALLOWED_AUDIO_MIMES,
] as const;

export function FileUploader({
	value,
	onChange,
	disabled = false,
	maxSize = MAX_FILE_SIZE_BYTES,
	accept = DEFAULT_ACCEPT,
	label = "Chọn tệp",
}: FileUploaderProps) {
	const {
		inputRef,
		uploading,
		error,
		dragging,
		acceptAttr,
		pickFile: handlePickFile,
		remove: handleRemove,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleInputChange,
	} = useFileUpload({
		accept,
		maxSize,
		disabled,
		currentMediaFileId: value?.mediaFileId,
		onUploaded: (result) => onChange(result),
		onCleared: () => onChange(null),
	});

	return (
		<div className="file-uploader">
			{!value ? (
				<div
					className={[
						"file-uploader__zone",
						dragging ? "file-uploader__zone--dragging" : "",
						disabled ? "file-uploader__zone--disabled" : "",
					]
						.filter(Boolean)
						.join(" ")}
					onClick={handlePickFile}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					role="button"
					tabIndex={disabled ? -1 : 0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							handlePickFile();
						}
					}}
				>
					{uploading ? (
						<div className="file-uploader__placeholder">
							<span className="file-uploader__spinner" />
							<span>Đang tải lên...</span>
						</div>
					) : (
						<div className="file-uploader__placeholder">
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
							</svg>
							<span>{label}</span>
							<span className="file-uploader__hint">
								Tối đa {formatFileSize(maxSize)}
							</span>
						</div>
					)}
				</div>
			) : (
				<div className="file-uploader__file">
					<div className="file-uploader__file-icon">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
						</svg>
					</div>
					<div className="file-uploader__file-info">
						<div className="file-uploader__file-name">
							{value.originalName ?? "Tệp đã tải lên"}
						</div>
						{value.fileSize != null && (
							<div className="file-uploader__file-meta">
								{formatFileSize(value.fileSize)}
							</div>
						)}
					</div>
					<div className="file-uploader__actions">
						<button
							type="button"
							className="file-uploader__btn"
							onClick={handlePickFile}
							disabled={disabled || uploading}
						>
							Thay
						</button>
						<button
							type="button"
							className="file-uploader__btn file-uploader__btn--remove"
							onClick={handleRemove}
							disabled={disabled || uploading}
						>
							Xoá
						</button>
					</div>
				</div>
			)}

			<input
				ref={inputRef}
				type="file"
				accept={acceptAttr}
				style={{ display: "none" }}
				disabled={disabled || uploading}
				onChange={handleInputChange}
			/>

			{error && <p className="file-uploader__error">{error}</p>}
		</div>
	);
}
