import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

import { validateFile } from "@/constants/media";
import { invalidateMediaUrl } from "@/lib";
import { mediaService } from "@/services/media.service";
import type { UploadResult } from "@/types/media.types";

interface UseFileUploadOptions {
	accept: readonly string[];
	maxSize: number;
	disabled: boolean;
	/** mediaFileId hiện tại để invalidate cache khi thay/xoá. */
	currentMediaFileId: string | null | undefined;
	onUploaded: (result: UploadResult) => void;
	onCleared: () => void;
}

/**
 * Logic upload dùng chung cho ImageUploader & FileUploader: chọn file, kéo-thả,
 * validate, upload qua mediaService, invalidate cache. Mỗi component tự render UI
 * và tự quyết định map `UploadResult` về shape onChange của mình.
 */
export function useFileUpload({
	accept,
	maxSize,
	disabled,
	currentMediaFileId,
	onUploaded,
	onCleared,
}: UseFileUploadOptions) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [dragging, setDragging] = useState(false);

	const pickFile = () => {
		if (disabled || uploading) return;
		inputRef.current?.click();
	};

	const handleFiles = async (files: FileList | null) => {
		if (!files || files.length === 0) return;
		const file = files[0];

		const validationError = validateFile(file, accept, maxSize);
		if (validationError) {
			setError(validationError.message);
			return;
		}

		setError(null);
		setUploading(true);

		const result = await mediaService.uploadViaDirect(file);

		setUploading(false);

		if (!result.success) {
			setError(result.error);
			return;
		}

		invalidateMediaUrl(currentMediaFileId);
		onUploaded(result.data);
	};

	const remove = () => {
		if (disabled || uploading) return;
		invalidateMediaUrl(currentMediaFileId);
		onCleared();
		setError(null);
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (disabled || uploading) return;
		setDragging(true);
	};

	const handleDragLeave = () => setDragging(false);

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setDragging(false);
		if (disabled || uploading) return;
		void handleFiles(e.dataTransfer.files);
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		void handleFiles(e.target.files);
		e.target.value = "";
	};

	return {
		inputRef,
		uploading,
		error,
		dragging,
		acceptAttr: accept.join(","),
		pickFile,
		remove,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleInputChange,
	};
}
