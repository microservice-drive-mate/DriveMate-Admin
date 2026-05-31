import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HEALTH_SERVICE_DEFINITIONS,
  healthMetricsService,
} from "@/services";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  IMPORTANT_METRIC_LABELS,
  POLL_INTERVAL_MS,
  countFailedDependencies,
  createInitialSnapshots,
  formatBytes,
  formatDateTime,
  formatDuration,
  getEndpointStatus,
  getServiceStatus,
  maskTarget,
  parsePrometheusMetrics,
  type MetricsState,
  type ServiceSnapshot,
} from "./systemHealthUtils";
import { DependencyBadge } from "./components/DependencyBadge";
import { StatusBadge } from "./components/StatusBadge";
import "./SystemHealthPage.css";

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
