import type { AllowedMimeCategory } from "@/types/media.types"

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export const ALLOWED_IMAGE_MIMES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
] as const

export const ALLOWED_DOCUMENT_MIMES = [
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const

export const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/webm"] as const

export const ALLOWED_AUDIO_MIMES = ["audio/mpeg", "audio/wav"] as const

export const ALLOWED_FILE_MIMES = [
	...ALLOWED_IMAGE_MIMES,
	...ALLOWED_DOCUMENT_MIMES,
	...ALLOWED_VIDEO_MIMES,
	...ALLOWED_AUDIO_MIMES,
] as const

export const MIME_TO_CATEGORY: Record<string, AllowedMimeCategory> = {
	...Object.fromEntries(
		ALLOWED_IMAGE_MIMES.map((m) => [m, "image" as const]),
	),
	...Object.fromEntries(
		ALLOWED_DOCUMENT_MIMES.map((m) => [m, "document" as const]),
	),
	...Object.fromEntries(
		ALLOWED_VIDEO_MIMES.map((m) => [m, "video" as const]),
	),
	...Object.fromEntries(
		ALLOWED_AUDIO_MIMES.map((m) => [m, "audio" as const]),
	),
}

export const FILE_TYPE_LABELS: Record<AllowedMimeCategory, string> = {
	image: "Hình ảnh",
	document: "Tài liệu",
	video: "Video",
	audio: "Âm thanh",
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export interface FileValidationError {
	code: "FILE_TOO_LARGE" | "INVALID_MIME_TYPE"
	message: string
}

export function validateFile(
	file: File,
	allowedMimes: readonly string[] = ALLOWED_FILE_MIMES,
	maxSize: number = MAX_FILE_SIZE_BYTES,
): FileValidationError | null {
	if (file.size > maxSize) {
		return {
			code: "FILE_TOO_LARGE",
			message: `Tệp vượt quá kích thước cho phép (${formatFileSize(maxSize)}).`,
		}
	}
	if (!allowedMimes.includes(file.type)) {
		return {
			code: "INVALID_MIME_TYPE",
			message: `Định dạng tệp không được hỗ trợ (${file.type || "không xác định"}).`,
		}
	}
	return null
}
