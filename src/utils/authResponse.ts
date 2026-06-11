import type {
	ApiResponse,
	LoginResponseData,
	LoginResponseWireData,
} from "@/types";

type ApiResponseLike<T> = {
	data: ApiResponse<T>;
};

export function normalizeLoginResponseData(
	data: LoginResponseWireData,
): LoginResponseData {
	return {
		accessToken: data.accessToken ?? data.access_token ?? "",
		refreshToken: data.refreshToken ?? data.refresh_token ?? "",
		expiresIn: data.expiresIn ?? data.expires_in ?? 0,
		refreshExpiresIn: data.refreshExpiresIn ?? data.refresh_expires_in ?? 0,
		tokenType: data.tokenType ?? data.token_type ?? "Bearer",
		scope: data.scope ?? "",
	};
}

export function normalizeLoginApiResponse<
	TResponse extends ApiResponseLike<LoginResponseWireData>,
>(
	response: TResponse,
): Omit<TResponse, "data"> & ApiResponseLike<LoginResponseData> {
	if (!response.data?.data) {
		return response as unknown as Omit<TResponse, "data"> &
			ApiResponseLike<LoginResponseData>;
	}

	return {
		...response,
		data: {
			...response.data,
			data: normalizeLoginResponseData(response.data.data),
		},
	};
}
