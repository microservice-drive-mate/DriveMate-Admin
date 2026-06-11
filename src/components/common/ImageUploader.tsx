import {
	ALLOWED_IMAGE_MIMES,
	MAX_FILE_SIZE_BYTES,
	formatFileSize,
} from "@/constants/media";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useMediaUrl } from "@/hooks/useMediaUrl";
import type { MediaReference } from "@/types/media.types";

import "./ImageUploader.css";

interface ImageUploaderProps {
	value: MediaReference | null;
	onChange: (next: MediaReference | null) => void;
	disabled?: boolean;
	maxSize?: number;
	accept?: readonly string[];
	helpText?: string;
	shape?: "square" | "circle";
}

export function ImageUploader({
	value,
	onChange,
	disabled = false,
	maxSize = MAX_FILE_SIZE_BYTES,
	accept = ALLOWED_IMAGE_MIMES,
	helpText,
	shape = "square",
}: ImageUploaderProps) {
	const { url: previewUrl, loading: loadingPreview } = useMediaUrl(
		value?.mediaFileId ?? null,
	);

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
		onUploaded: (result) =>
			onChange({
				mediaFileId: result.mediaFileId,
				publicUrl: result.publicUrl,
			}),
		onCleared: () => onChange(null),
	});

	const hasImage = !!value?.mediaFileId;

	return (
		<div className={`image-uploader image-uploader--${shape}`}>
			<div
				className={[
					"image-uploader__zone",
					dragging ? "image-uploader__zone--dragging" : "",
					hasImage ? "image-uploader__zone--has-image" : "",
					disabled ? "image-uploader__zone--disabled" : "",
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
				{uploading || loadingPreview ? (
					<div className="image-uploader__placeholder">
						<span className="image-uploader__spinner" />
						<span>{uploading ? "Đang tải lên..." : "Đang tải ảnh..."}</span>
					</div>
				) : previewUrl ? (
					<img
						src={previewUrl}
						alt="Preview"
						className="image-uploader__preview"
					/>
				) : (
					<div className="image-uploader__placeholder">
						<svg
							width="40"
							height="40"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" />
							<circle cx="8.5" cy="8.5" r="1.5" />
							<path d="m21 15-5-5L5 21" />
						</svg>
						<span>Bấm hoặc kéo thả ảnh vào đây</span>
						<span className="image-uploader__hint">
							Tối đa {formatFileSize(maxSize)}
						</span>
					</div>
				)}
			</div>

			<input
				ref={inputRef}
				type="file"
				accept={acceptAttr}
				style={{ display: "none" }}
				disabled={disabled || uploading}
				onChange={handleInputChange}
			/>

			{(hasImage || error) && !uploading && (
				<div className="image-uploader__actions">
					{hasImage && (
						<button
							type="button"
							className="image-uploader__btn image-uploader__btn--replace"
							onClick={handlePickFile}
							disabled={disabled}
						>
							Thay ảnh
						</button>
					)}
					{hasImage && (
						<button
							type="button"
							className="image-uploader__btn image-uploader__btn--remove"
							onClick={handleRemove}
							disabled={disabled}
						>
							Xoá
						</button>
					)}
				</div>
			)}

			{helpText && !error && (
				<p className="image-uploader__help">{helpText}</p>
			)}
			{error && <p className="image-uploader__error">{error}</p>}
		</div>
	);
}
