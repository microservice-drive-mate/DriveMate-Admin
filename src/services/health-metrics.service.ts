import { isAxiosError } from "axios";
import { apiService } from "@/lib";
import { parseError } from "@/utils";
import type {
  HealthEndpointResult,
  HealthLivenessReport,
  HealthMetricsResult,
  HealthReadinessReport,
  HealthServiceDefinition,
  HealthWrappedResponse,
} from "@/types/health-metrics.types";

export const HEALTH_SERVICE_DEFINITIONS: HealthServiceDefinition[] = [
  { id: "identity", label: "Identity", prefix: "identity-service" },
  { id: "user", label: "User", prefix: "user-service" },
  { id: "course", label: "Course", prefix: "course-service" },
  { id: "question", label: "Question", prefix: "question-service" },
  { id: "exam", label: "Exam", prefix: "exam-service" },
  { id: "analytics", label: "Analytics", prefix: "analytics-service" },
  { id: "audit", label: "Audit", prefix: "audit-service" },
  { id: "media", label: "Media", prefix: "media-service" },
  { id: "notification", label: "Notification", prefix: "notification-service" },
];

function servicePath(service: HealthServiceDefinition, endpoint: string) {
  return `/${service.prefix}${endpoint}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorData<T>(payload: HealthWrappedResponse<T> | undefined): T | undefined {
  if (!payload || !isObject(payload.errors)) return undefined;
  return payload.errors as T;
}

async function getHealthReport<T>(
  service: HealthServiceDefinition,
  endpoint: "/health/live" | "/health/ready",
): Promise<HealthEndpointResult<T>> {
  try {
    const response = await apiService.get<HealthWrappedResponse<T>>(
      servicePath(service, endpoint),
      {
        headers: { Accept: "application/json" },
      },
    );

    if (response.data.success) {
      return {
        ok: true,
        status: response.status,
        data: response.data.data,
        code: response.data.code,
        message: response.data.message,
        timestamp: response.data.timestamp,
      };
    }

    return {
      ok: false,
      status: response.status,
      data: getErrorData(response.data),
      code: response.data.code,
      message: response.data.message,
      timestamp: response.data.timestamp,
    };
  } catch (error) {
    if (isAxiosError<HealthWrappedResponse<T>>(error)) {
      const payload = error.response?.data;
      return {
        ok: false,
        status: error.response?.status,
        data: getErrorData(payload),
        code: payload?.code,
        message: payload?.message ?? error.message,
        timestamp: payload?.timestamp,
      };
    }

    const parsed = parseError(error);
    return {
      ok: false,
      status: parsed.status,
      code: parsed.code,
      message: parsed.message,
    };
  }
}

async function getMetrics(service: HealthServiceDefinition): Promise<HealthMetricsResult> {
  try {
    const response = await apiService.get<string>(servicePath(service, "/metrics"), {
      headers: { Accept: "text/plain" },
      responseType: "text",
    });

    return {
      ok: true,
      status: response.status,
      data: typeof response.data === "string" ? response.data : String(response.data ?? ""),
    };
  } catch (error) {
    if (isAxiosError(error)) {
      const responseData = error.response?.data;
      return {
        ok: false,
        status: error.response?.status,
        data: typeof responseData === "string" ? responseData : undefined,
        code: isObject(responseData) && typeof responseData.code === "string"
          ? responseData.code
          : undefined,
        message: isObject(responseData) && typeof responseData.message === "string"
          ? responseData.message
          : error.message,
      };
    }

    const parsed = parseError(error);
    return {
      ok: false,
      status: parsed.status,
      code: parsed.code,
      message: parsed.message,
    };
  }
}

export const healthMetricsService = {
  getLiveness: (service: HealthServiceDefinition) =>
    getHealthReport<HealthLivenessReport>(service, "/health/live"),

  getReadiness: (service: HealthServiceDefinition) =>
    getHealthReport<HealthReadinessReport>(service, "/health/ready"),

  getMetrics,
};
