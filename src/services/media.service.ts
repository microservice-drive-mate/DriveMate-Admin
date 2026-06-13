import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
	FileObject,
	MediaFileListParams,
	PresignedDownloadResponse,
	UploadInitPayload,
	UploadInitResponse,
	UploadResult,
} from "@/types/media.types";
import { apiService } from "@/lib";
import { withErrorHandling } from "@/utils";

const uploadInitRaw = withErrorHandling((payload: UploadInitPayload) =>
	apiService.post<ApiResponse<UploadInitResponse>>("/media/files/init", payload),
);

const confirmUploadRaw = withErrorHandling((id: string) =>
	apiService.post<ApiResponse<FileObject>>(`/media/files/${id}/complete`),
);

async function uploadViaDirect(
	file: File,
): Promise<
	| { success: true; data: UploadResult }
	| { success: false; error: string; code: string }
> {
	const init = await uploadInitRaw({
		originalName: file.name,
		mimeType: file.type,
		fileSize: file.size,
	});

	if (!init.success) {
		return { success: false, error: init.error, code: init.code };
	}

	const { mediaFileId, uploadUrl, publicUrl } = init.data;

	try {
		const uploadResponse = await fetch(uploadUrl, {
			method: "PUT",
			headers: {
				"Content-Type": file.type,
				"x-ms-blob-type": "BlockBlob",
			},
			body: file,
		});

		if (!uploadResponse.ok) {
			return {
				success: false,
				error: `Upload to the presigned URL failed (${uploadResponse.status}).`,
				code: "PRESIGNED_UPLOAD_FAILED",
			};
		}
	} catch (err) {
		return {
			success: false,
			error:
				err instanceof Error
					? err.message
					: "Unable to upload file to the presigned URL.",
			code: "PRESIGNED_UPLOAD_FAILED",
		};
	}

	const completeResult = await confirmUploadRaw(mediaFileId);
	if (!completeResult.success) {
		return { success: false, error: completeResult.error, code: completeResult.code };
	}

	return {
		success: true,
		data: {
			mediaFileId,
			publicUrl,
			originalName: file.name,
			mimeType: file.type,
			fileSize: file.size,
		},
	};
}

export const mediaService = {
	uploadInit: uploadInitRaw,

	uploadViaDirect,

	confirmUpload: confirmUploadRaw,

	getMetadata: withErrorHandling((id: string) =>
		apiService.get<ApiResponse<FileObject>>(`/media/files/${id}`),
	),

	getDownloadUrl: withErrorHandling((id: string) =>
		apiService.get<ApiResponse<PresignedDownloadResponse>>(
			`/media/files/${id}/url`,
		),
	),

	list: withErrorHandling((params?: MediaFileListParams) =>
		apiService.get<ApiResponse<PaginatedResponse<FileObject>>>(
			"/admin/media/files",
			{ params },
		),
	),

	delete: withErrorHandling((id: string) =>
		apiService.delete<ApiResponse<null>>(`/admin/media/files/${id}`),
	),

	serverUpload: withErrorHandling((file: File) => {
		const formData = new FormData();
		formData.append("file", file);
		return apiService.post<ApiResponse<FileObject>>("/media/files", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	}),
};
