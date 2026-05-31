import { HEALTH_SERVICE_DEFINITIONS } from "@/services";
import type {
	HealthEndpointResult,
	HealthLivenessReport,
	HealthReadinessReport,
	HealthServiceDefinition,
	ParsedPrometheusMetric,
} from "@/types";

export const POLL_INTERVAL_MS = 10000;

export const IMPORTANT_METRIC_LABELS: Record<string, string> = {
	nodejs_process_cpu_user_seconds_total: "CPU user time",
	nodejs_process_cpu_system_seconds_total: "CPU system time",
	nodejs_eventloop_lag_seconds: "Event loop lag",
	process_resident_memory_bytes: "Resident memory",
	nodejs_heap_size_total_bytes: "Heap total",
	nodejs_heap_size_used_bytes: "Heap used",
	nodejs_external_memory_bytes: "External memory",
};

export type ServiceStatus = "loading" | "ok" | "error";

export interface ServiceSnapshot {
	service: HealthServiceDefinition;
	live?: HealthEndpointResult<HealthLivenessReport>;
	ready?: HealthEndpointResult<HealthReadinessReport>;
	loading: boolean;
	lastChecked?: string;
}

export interface MetricsState {
	loading: boolean;
	raw: string;
	parsed: ParsedPrometheusMetric[];
	error: string;
	status?: number;
	serviceId?: string;
}

export function createInitialSnapshots(): Record<string, ServiceSnapshot> {
	return HEALTH_SERVICE_DEFINITIONS.reduce<Record<string, ServiceSnapshot>>(
		(acc, service) => {
			acc[service.id] = { service, loading: true };
			return acc;
		},
		{},
	);
}

export function formatDateTime(iso?: string) {
	if (!iso) return "Never";
	return new Date(iso).toLocaleString("vi-VN");
}

export function formatBytes(value?: number) {
	if (typeof value !== "number" || Number.isNaN(value)) return "-";
	const units = ["B", "KB", "MB", "GB"];
	let nextValue = value;
	let unitIndex = 0;
	while (nextValue >= 1024 && unitIndex < units.length - 1) {
		nextValue /= 1024;
		unitIndex += 1;
	}
	return `${nextValue.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDuration(seconds?: number) {
	if (typeof seconds !== "number" || Number.isNaN(seconds)) return "-";
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${Math.max(0, minutes)}m`;
}

function formatMetricValue(name: string, value: number) {
	if (name.includes("bytes") || name.includes("memory")) {
		return formatBytes(value);
	}
	if (name === "nodejs_eventloop_lag_seconds") {
		return `${(value * 1000).toFixed(2)} ms`;
	}
	if (name.includes("seconds")) {
		return `${value.toFixed(3)} s`;
	}
	return value.toLocaleString("vi-VN", { maximumFractionDigits: 3 });
}

function parseMetricLabels(input?: string) {
	const labels: Record<string, string> = {};
	if (!input) return labels;

	const regex = /([a-zA-Z_][a-zA-Z0-9_]*)="([^"]*)"/g;
	let match = regex.exec(input);
	while (match) {
		labels[match[1]] = match[2];
		match = regex.exec(input);
	}
	return labels;
}

export function parsePrometheusMetrics(raw: string): ParsedPrometheusMetric[] {
	const helpByName = new Map<string, string>();
	const typeByName = new Map<string, string>();
	const metrics: ParsedPrometheusMetric[] = [];

	raw.split(/\r?\n/).forEach((line) => {
		const trimmed = line.trim();
		if (!trimmed) return;

		const helpMatch = trimmed.match(/^# HELP\s+(\S+)\s+(.+)$/);
		if (helpMatch) {
			helpByName.set(helpMatch[1], helpMatch[2]);
			return;
		}

		const typeMatch = trimmed.match(/^# TYPE\s+(\S+)\s+(\S+)$/);
		if (typeMatch) {
			typeByName.set(typeMatch[1], typeMatch[2]);
			return;
		}

		if (trimmed.startsWith("#")) return;

		const metricMatch = trimmed.match(
			/^([a-zA-Z_:][a-zA-Z0-9_:]*)(?:\{([^}]*)\})?\s+(-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)/i,
		);
		if (!metricMatch) return;

		const value = Number(metricMatch[3]);
		if (!Number.isFinite(value)) return;

		metrics.push({
			name: metricMatch[1],
			value,
			formattedValue: formatMetricValue(metricMatch[1], value),
			labels: parseMetricLabels(metricMatch[2]),
			help: helpByName.get(metricMatch[1]),
			type: typeByName.get(metricMatch[1]),
		});
	});

	const important = metrics.filter((metric) =>
		Object.prototype.hasOwnProperty.call(IMPORTANT_METRIC_LABELS, metric.name),
	);
	return important.length > 0 ? important : metrics.slice(0, 8);
}

export function getEndpointStatus<T extends { status: string }>(
	result: HealthEndpointResult<T> | undefined,
	loading: boolean,
): ServiceStatus {
	if (!result) return loading ? "loading" : "error";
	if (!result.ok) return "error";
	return result.data.status === "ok" ? "ok" : "error";
}

export function getServiceStatus(snapshot: ServiceSnapshot): ServiceStatus {
	if (snapshot.loading && !snapshot.live && !snapshot.ready) return "loading";
	const liveStatus = getEndpointStatus(snapshot.live, snapshot.loading);
	const readyStatus = getEndpointStatus(snapshot.ready, snapshot.loading);
	return liveStatus === "ok" && readyStatus === "ok" ? "ok" : "error";
}

export function countFailedDependencies(snapshot: ServiceSnapshot) {
	return snapshot.ready?.data?.checks.filter((check) => check.status === "error").length ?? 0;
}

export function maskTarget(target: string) {
	try {
		const url = new URL(target);
		if (url.username || url.password) {
			url.username = url.username ? "***" : "";
			url.password = url.password ? "***" : "";
		}
		return url.toString();
	} catch {
		return target.replace(/\/\/([^:@/]+):([^@/]+)@/, "//***:***@");
	}
}
