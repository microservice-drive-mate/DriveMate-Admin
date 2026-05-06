import { ERROR_CODES, ERROR_MESSAGES } from "@/constants";
import type { ApiResponse } from "@/types";
import { isAxiosError } from "axios";

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 500, code = ERROR_CODES.INTERNAL_ERROR) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const parseError = (error: unknown): ApiError => {
  if (!isAxiosError(error) || !error.response) {
    return new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 0, ERROR_CODES.NETWORK_ERROR);
  }

  const { status, data } = error.response;

  if (status === 401 && (!data || data === "")) {
    return new ApiError(
      "Invalid username or password. Please try again.",
      401,
      ERROR_CODES.UNAUTHORIZED,
    );
  }

  const errorCode = data?.error?.code || data?.code || ERROR_CODES.INTERNAL_ERROR;
  const errorMessage =
    data?.error?.message || data?.message || data?.error || ERROR_MESSAGES.GENERIC_ERROR;

  const validCode = Object.values(ERROR_CODES).includes(errorCode)
    ? errorCode
    : ERROR_CODES.INTERNAL_ERROR;

  const finalMessage =
    errorMessage && errorMessage !== ERROR_MESSAGES.GENERIC_ERROR
      ? errorMessage
      : ERROR_MESSAGES[validCode as keyof typeof ERROR_MESSAGES] || errorMessage;

  return new ApiError(finalMessage, status, validCode);
};

export const withErrorHandling = <TArgs extends unknown[], TData>(
  asyncFn: (...args: TArgs) => Promise<{ data: ApiResponse<TData> }>,
) => {
  return async (
    ...args: TArgs
  ): Promise<
    | { success: true; data: TData; message: string }
    | { success: false; error: string; code: string; status?: number }
  > => {
    try {
      const response = await asyncFn(...args);

      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message ?? "",
        };
      }

      return {
        success: false,
        error: response.data?.message ?? ERROR_MESSAGES.GENERIC_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
      };
    } catch (error: unknown) {
      const parsedError = parseError(error);

      return {
        success: false,
        error: parsedError.message,
        code: parsedError.code,
        status: parsedError.status,
      };
    }
  };
};

export const logError = (error: unknown, context: Record<string, unknown> = {}) => {
  console.error("Application Error:", {
    message: error instanceof Error ? error.message : String(error),
    code: error instanceof ApiError ? error.code : undefined,
    status: error instanceof ApiError ? error.status : undefined,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

export const extractErrorMessage = (err: unknown, fallback = "Có lỗi xảy ra."): string => {
  return err instanceof Error ? err.message : fallback;
};

export const shouldLogout = (error: unknown): boolean => {
  if (!(error instanceof ApiError)) return false;
  return (
    error.status === 401 ||
    error.status === 403 ||
    error.code === ERROR_CODES.UNAUTHORIZED ||
    error.code === ERROR_CODES.FORBIDDEN
  );
};
