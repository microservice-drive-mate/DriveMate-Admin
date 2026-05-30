import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HEALTH_SERVICE_DEFINITIONS,
  healthMetricsService,
} from "@/services";
import { Skeleton } from "@/components/ui/Skeleton";
import type {
  HealthEndpointResult,
  HealthLivenessReport,
  HealthReadinessReport,
  HealthServiceDefinition,
  ParsedPrometheusMetric,
} from "@/types";
import "./SystemHealthPage.css";

const POLL_INTERVAL_MS = 10000;

const IMPORTANT_METRIC_LABELS: Record<string, string> = {
  nodejs_process_cpu_user_seconds_total: "CPU user time",
  nodejs_process_cpu_system_seconds_total: "CPU system time",
  nodejs_eventloop_lag_seconds: "Event loop lag",
  process_resident_memory_bytes: "Resident memory",
  nodejs_heap_size_total_bytes: "Heap total",
  nodejs_heap_size_used_bytes: "Heap used",
  nodejs_external_memory_bytes: "External memory",
};

type ServiceStatus = "loading" | "ok" | "error";

interface ServiceSnapshot {
  service: HealthServiceDefinition;
  live?: HealthEndpointResult<HealthLivenessReport>;
  ready?: HealthEndpointResult<HealthReadinessReport>;
  loading: boolean;
  lastChecked?: string;
}

interface MetricsState {
  loading: boolean;
  raw: string;
  parsed: ParsedPrometheusMetric[];
  error: string;
  status?: number;
  serviceId?: string;
}

function createInitialSnapshots(): Record<string, ServiceSnapshot> {
  return HEALTH_SERVICE_DEFINITIONS.reduce<Record<string, ServiceSnapshot>>(
    (acc, service) => {
      acc[service.id] = { service, loading: true };
      return acc;
    },
    {},
  );
}

function formatDateTime(iso?: string) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("vi-VN");
}

function formatBytes(value?: number) {
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

function formatDuration(seconds?: number) {
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

function parsePrometheusMetrics(raw: string): ParsedPrometheusMetric[] {
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

function getEndpointStatus<T extends { status: string }>(
  result: HealthEndpointResult<T> | undefined,
  loading: boolean,
): ServiceStatus {
  if (!result) return loading ? "loading" : "error";
  if (!result.ok) return "error";
  return result.data.status === "ok" ? "ok" : "error";
}

function getServiceStatus(snapshot: ServiceSnapshot): ServiceStatus {
  if (snapshot.loading && !snapshot.live && !snapshot.ready) return "loading";
  const liveStatus = getEndpointStatus(snapshot.live, snapshot.loading);
  const readyStatus = getEndpointStatus(snapshot.ready, snapshot.loading);
  return liveStatus === "ok" && readyStatus === "ok" ? "ok" : "error";
}

function countFailedDependencies(snapshot: ServiceSnapshot) {
  return snapshot.ready?.data?.checks.filter((check) => check.status === "error").length ?? 0;
}

function maskTarget(target: string) {
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

function StatusBadge({ status, label }: { status: ServiceStatus; label?: string }) {
  return (
    <span className={`system-health-status system-health-status--${status}`}>
      {label ?? (status === "ok" ? "OK" : status === "loading" ? "Loading" : "Error")}
    </span>
  );
}

function DependencyBadge({ status }: { status: string }) {
  const normalized = status === "ok" || status === "skipped" ? status : "error";
  return (
    <span className={`system-health-dependency__badge system-health-dependency__badge--${normalized}`}>
      {status}
    </span>
  );
}

export default function SystemHealthPage() {
  const [snapshots, setSnapshots] = useState<Record<string, ServiceSnapshot>>(
    createInitialSnapshots,
  );
  const [lastRefresh, setLastRefresh] = useState<string>();
  const [selectedServiceId, setSelectedServiceId] = useState(
    HEALTH_SERVICE_DEFINITIONS[0].id,
  );
  const [metrics, setMetrics] = useState<MetricsState>({
    loading: false,
    raw: "",
    parsed: [],
    error: "",
    serviceId: undefined,
  });
  const healthRequestRef = useRef(0);
  const metricsRequestRef = useRef(0);

  const selectedService = useMemo(
    () =>
      HEALTH_SERVICE_DEFINITIONS.find((service) => service.id === selectedServiceId) ??
      HEALTH_SERVICE_DEFINITIONS[0],
    [selectedServiceId],
  );

  const serviceSnapshots = HEALTH_SERVICE_DEFINITIONS.map(
    (service) => snapshots[service.id] ?? { service, loading: true },
  );
  const selectedSnapshot =
    snapshots[selectedService.id] ?? { service: selectedService, loading: true };

  const refreshHealth = useCallback(async () => {
    const requestId = healthRequestRef.current + 1;
    healthRequestRef.current = requestId;

    setSnapshots((current) => {
      const next = { ...current };
      HEALTH_SERVICE_DEFINITIONS.forEach((service) => {
        next[service.id] = {
          ...(current[service.id] ?? { service }),
          service,
          loading: true,
        };
      });
      return next;
    });

    const checkedAt = new Date().toISOString();
    const results = await Promise.all(
      HEALTH_SERVICE_DEFINITIONS.map(async (service) => {
        const [live, ready] = await Promise.all([
          healthMetricsService.getLiveness(service),
          healthMetricsService.getReadiness(service),
        ]);
        return { service, live, ready };
      }),
    );

    if (healthRequestRef.current !== requestId) return;

    setSnapshots((current) => {
      const next = { ...current };
      results.forEach(({ service, live, ready }) => {
        next[service.id] = {
          service,
          live,
          ready,
          loading: false,
          lastChecked: checkedAt,
        };
      });
      return next;
    });
    setLastRefresh(checkedAt);
  }, []);

  const refreshMetrics = useCallback(async () => {
    const requestId = metricsRequestRef.current + 1;
    metricsRequestRef.current = requestId;

    setMetrics((current) => ({
      ...(current.serviceId === selectedService.id
        ? current
        : { raw: "", parsed: [] }),
      loading: true,
      error: "",
      status: undefined,
      serviceId: selectedService.id,
    }));

    const result = await healthMetricsService.getMetrics(selectedService);
    if (metricsRequestRef.current !== requestId) return;

    if (result.ok) {
      setMetrics({
        loading: false,
        raw: result.data,
        parsed: parsePrometheusMetrics(result.data),
        error: "",
        status: result.status,
        serviceId: selectedService.id,
      });
      return;
    }

    setMetrics({
      loading: false,
      raw: result.data ?? "",
      parsed: result.data ? parsePrometheusMetrics(result.data) : [],
      error: result.message,
      status: result.status,
      serviceId: selectedService.id,
    });
  }, [selectedService]);

  useEffect(() => {
    const initialRefreshId = window.setTimeout(refreshHealth, 0);
    const intervalId = window.setInterval(refreshHealth, POLL_INTERVAL_MS);
    return () => {
      window.clearTimeout(initialRefreshId);
      window.clearInterval(intervalId);
    };
  }, [refreshHealth]);

  useEffect(() => {
    const initialRefreshId = window.setTimeout(refreshMetrics, 0);
    return () => window.clearTimeout(initialRefreshId);
  }, [refreshMetrics]);

  const okCount = serviceSnapshots.filter((snapshot) => getServiceStatus(snapshot) === "ok").length;
  const loadingCount = serviceSnapshots.filter(
    (snapshot) => getServiceStatus(snapshot) === "loading",
  ).length;
  const errorCount = serviceSnapshots.length - okCount - loadingCount;
  const failedDependencyCount = serviceSnapshots.reduce(
    (total, snapshot) => total + countFailedDependencies(snapshot),
    0,
  );
  const isRefreshing = serviceSnapshots.some((snapshot) => snapshot.loading);

  const liveReport = selectedSnapshot.live?.data;
  const readyReport = selectedSnapshot.ready?.data;
  const memory = liveReport?.memory;
  const dependencyChecks = readyReport?.checks ?? [];
  const initialHealthLoading = !lastRefresh && isRefreshing;
  const showSelectedHealthSkeleton = initialHealthLoading && !selectedSnapshot.lastChecked;
  const metricsBelongToSelectedService = metrics.serviceId === selectedService.id;
  const showMetricsSkeleton =
    !metricsBelongToSelectedService ||
    (metrics.loading &&
      metrics.raw === "" &&
      metrics.parsed.length === 0 &&
      !metrics.error);

  return (
    <div className="system-health-page">
      <div className="system-health-page__header">
        <div>
          <h1>System Health</h1>
          <p>Monitor service liveness, readiness, dependencies, and Prometheus metrics.</p>
        </div>
        <div className="system-health-page__actions">
          <span>Auto-refresh 10s</span>
          <button
            type="button"
            onClick={refreshHealth}
            disabled={isRefreshing}
            className="system-health-page__refresh"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <section className="system-health-summary" aria-label="System health summary">
        <div className="system-health-summary__item">
          <span>Services OK</span>
          <strong>{initialHealthLoading ? <Skeleton width={34} height={26} /> : okCount}</strong>
        </div>
        <div className="system-health-summary__item system-health-summary__item--error">
          <span>Services Error</span>
          <strong>{initialHealthLoading ? <Skeleton width={34} height={26} /> : errorCount}</strong>
        </div>
        <div className="system-health-summary__item">
          <span>Loading</span>
          <strong>{initialHealthLoading ? <Skeleton width={34} height={26} /> : loadingCount}</strong>
        </div>
        <div className="system-health-summary__item system-health-summary__item--warning">
          <span>Dependency Errors</span>
          <strong>{initialHealthLoading ? <Skeleton width={34} height={26} /> : failedDependencyCount}</strong>
        </div>
        <div className="system-health-summary__item system-health-summary__item--wide">
          <span>Last Refresh</span>
          <strong>
            {initialHealthLoading ? <Skeleton width="72%" height={20} /> : formatDateTime(lastRefresh)}
          </strong>
        </div>
      </section>

      <section className="system-health-section">
        <div className="system-health-section__header">
          <h2>Services</h2>
          <span>{HEALTH_SERVICE_DEFINITIONS.length} monitored services</span>
        </div>
        <div className="system-health-table-wrap">
          <table className="system-health-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Liveness</th>
                <th>Readiness</th>
                <th>Uptime</th>
                <th>Memory</th>
                <th>Dependencies</th>
                <th>Last Check</th>
              </tr>
            </thead>
            <tbody>
              {initialHealthLoading ? (
                HEALTH_SERVICE_DEFINITIONS.map((service) => (
                  <tr className="system-health-table__row" key={service.id}>
                    <td>
                      <div className="system-health-service-skeleton">
                        <Skeleton variant="text" width={96} height={14} />
                        <Skeleton variant="text" width={146} height={12} />
                      </div>
                    </td>
                    <td><Skeleton width={72} height={24} /></td>
                    <td><Skeleton width={72} height={24} /></td>
                    <td><Skeleton variant="text" width={52} height={14} /></td>
                    <td><Skeleton variant="text" width={118} height={14} /></td>
                    <td><Skeleton variant="text" width={64} height={14} /></td>
                    <td><Skeleton variant="text" width={132} height={14} /></td>
                  </tr>
                ))
              ) : serviceSnapshots.map((snapshot) => {
                const liveStatus = getEndpointStatus(snapshot.live, snapshot.loading);
                const readyStatus = getEndpointStatus(snapshot.ready, snapshot.loading);
                const checks = snapshot.ready?.data?.checks ?? [];
                const failedChecks = countFailedDependencies(snapshot);
                const serviceMemory = snapshot.live?.data?.memory;

                return (
                  <tr
                    key={snapshot.service.id}
                    className={
                      selectedServiceId === snapshot.service.id
                        ? "system-health-table__row system-health-table__row--selected"
                        : "system-health-table__row"
                    }
                  >
                    <td>
                      <button
                        type="button"
                        className="system-health-service-button"
                        onClick={() => setSelectedServiceId(snapshot.service.id)}
                      >
                        <span>{snapshot.service.label}</span>
                        <small>/{snapshot.service.prefix}</small>
                      </button>
                    </td>
                    <td><StatusBadge status={liveStatus} /></td>
                    <td><StatusBadge status={readyStatus} /></td>
                    <td>{formatDuration(snapshot.live?.data?.uptimeSeconds)}</td>
                    <td>{formatBytes(serviceMemory?.heapUsed)} / {formatBytes(serviceMemory?.heapTotal)}</td>
                    <td>
                      {checks.length === 0
                        ? "-"
                        : `${checks.length - failedChecks}/${checks.length} OK`}
                    </td>
                    <td>{formatDateTime(snapshot.lastChecked)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="system-health-detail-grid">
        <section className="system-health-section">
          <div className="system-health-section__header">
            <h2>{selectedService.label} Details</h2>
            <StatusBadge status={getServiceStatus(selectedSnapshot)} />
          </div>

          {showSelectedHealthSkeleton ? (
            <div className="system-health-detail-list">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index}>
                  <Skeleton variant="text" width="44%" height={12} />
                  <Skeleton variant="text" width="72%" height={15} />
                </div>
              ))}
            </div>
          ) : (
            <div className="system-health-detail-list">
              <div>
                <span>Service name</span>
                <strong>{liveReport?.service ?? readyReport?.service ?? selectedService.prefix}</strong>
              </div>
              <div>
                <span>PID</span>
                <strong>{liveReport?.pid ?? "-"}</strong>
              </div>
              <div>
                <span>Uptime</span>
                <strong>{formatDuration(liveReport?.uptimeSeconds)}</strong>
              </div>
              <div>
                <span>Process timestamp</span>
                <strong>{formatDateTime(liveReport?.timestamp ?? readyReport?.timestamp)}</strong>
              </div>
              <div>
                <span>RSS</span>
                <strong>{formatBytes(memory?.rss)}</strong>
              </div>
              <div>
                <span>Heap used</span>
                <strong>{formatBytes(memory?.heapUsed)}</strong>
              </div>
              <div>
                <span>Heap total</span>
                <strong>{formatBytes(memory?.heapTotal)}</strong>
              </div>
              <div>
                <span>External</span>
                <strong>{formatBytes(memory?.external)}</strong>
              </div>
            </div>
          )}

          {selectedSnapshot.live && !selectedSnapshot.live.ok && (
            <div className="system-health-inline-error">
              Liveness error: {selectedSnapshot.live.message}
            </div>
          )}
          {selectedSnapshot.ready && !selectedSnapshot.ready.ok && (
            <div className="system-health-inline-error">
              Readiness error: {selectedSnapshot.ready.message}
            </div>
          )}
        </section>

        <section className="system-health-section">
          <div className="system-health-section__header">
            <h2>Dependency Checks</h2>
            <span>{dependencyChecks.length} checks</span>
          </div>

          {showSelectedHealthSkeleton ? (
            <div className="system-health-dependency-list">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="system-health-dependency" key={index}>
                  <div className="system-health-dependency__top">
                    <Skeleton variant="text" width={108} height={15} />
                    <Skeleton width={58} height={22} />
                  </div>
                  <Skeleton variant="text" width="82%" height={13} />
                  <div className="system-health-dependency__meta">
                    <Skeleton variant="text" width="48%" height={12} />
                  </div>
                </div>
              ))}
            </div>
          ) : dependencyChecks.length === 0 ? (
            <div className="system-health-empty">No dependency checks returned.</div>
          ) : (
            <div className="system-health-dependency-list">
              {dependencyChecks.map((check) => (
                <div className="system-health-dependency" key={`${check.name}-${check.target}`}>
                  <div className="system-health-dependency__top">
                    <strong>{check.name}</strong>
                    <DependencyBadge status={check.status} />
                  </div>
                  <span className="system-health-dependency__target">
                    {maskTarget(check.target)}
                  </span>
                  <div className="system-health-dependency__meta">
                    <span>Latency: {typeof check.latencyMs === "number" ? `${check.latencyMs} ms` : "-"}</span>
                    {check.error && <span>Error: {check.error}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="system-health-section">
        <div className="system-health-section__header">
          <div>
            <h2>Metrics</h2>
            <span>Prometheus metrics for /{selectedService.prefix}/metrics</span>
          </div>
          <button
            type="button"
            onClick={refreshMetrics}
            disabled={metrics.loading}
            className="system-health-page__refresh"
          >
            {metrics.loading ? "Loading..." : "Reload Metrics"}
          </button>
        </div>

        {metrics.error && metricsBelongToSelectedService && (
          <div className="system-health-inline-error">
            Metrics error{metrics.status ? ` (${metrics.status})` : ""}: {metrics.error}
          </div>
        )}

        {showMetricsSkeleton ? (
          <div className="system-health-metrics-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="system-health-metric" key={index}>
                <Skeleton variant="text" width="64%" height={12} />
                <Skeleton variant="text" width="46%" height={22} />
                <Skeleton variant="text" width="74%" height={11} />
              </div>
            ))}
          </div>
        ) : metrics.parsed.length === 0 && !metrics.loading ? (
          <div className="system-health-empty">No parseable metrics returned.</div>
        ) : (
          <div className="system-health-metrics-grid">
            {metrics.parsed.map((metric) => (
              <div
                className="system-health-metric"
                key={`${metric.name}-${JSON.stringify(metric.labels)}`}
              >
                <span>{IMPORTANT_METRIC_LABELS[metric.name] ?? metric.name}</span>
                <strong>{metric.formattedValue}</strong>
                <small>{metric.type ?? "metric"} {metric.labels.service ? `- ${metric.labels.service}` : ""}</small>
              </div>
            ))}
          </div>
        )}

        <details className="system-health-raw" open={!!metrics.error && metricsBelongToSelectedService}>
          <summary>Raw Prometheus text</summary>
          <pre>{metricsBelongToSelectedService && metrics.raw ? metrics.raw : "No raw metrics loaded."}</pre>
        </details>
      </section>
    </div>
  );
}
