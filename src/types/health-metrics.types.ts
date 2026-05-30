import type { ApiResponse } from "./api.types";

export interface HealthServiceDefinition {
  id: string;
  label: string;
  prefix: string;
}

export interface HealthMemoryUsage {
  rss?: number;
  heapTotal?: number;
  heapUsed?: number;
  external?: number;
  arrayBuffers?: number;
  [key: string]: number | undefined;
}

export interface HealthLivenessReport {
  service: string;
  status: "ok" | string;
  timestamp: string;
  uptimeSeconds: number;
  pid: number;
  memory: HealthMemoryUsage;
}

export interface HealthDependencyReport {
  name: string;
  status: "ok" | "error" | "skipped" | string;
  target: string;
  latencyMs?: number;
  error?: string;
}

export interface HealthReadinessReport {
  service: string;
  status: "ok" | "error" | string;
  timestamp: string;
  checks: HealthDependencyReport[];
}

export type HealthWrappedResponse<T> = ApiResponse<T> & {
  errors?: T | Record<string, unknown>;
};

export type HealthEndpointResult<T> =
  | {
      ok: true;
      status: number;
      data: T;
      code?: string;
      message: string;
      timestamp?: string;
    }
  | {
      ok: false;
      status?: number;
      data?: T;
      code?: string;
      message: string;
      timestamp?: string;
    };

export type HealthMetricsResult =
  | {
      ok: true;
      status: number;
      data: string;
    }
  | {
      ok: false;
      status?: number;
      data?: string;
      message: string;
      code?: string;
    };

export interface ParsedPrometheusMetric {
  name: string;
  value: number;
  formattedValue: string;
  labels: Record<string, string>;
  help?: string;
  type?: string;
}
