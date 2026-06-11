import { Skeleton } from "@/components/ui/Skeleton";
import {
  formatBytes,
  formatDateTime,
  formatDuration,
  getServiceStatus,
  maskTarget,
} from "./systemHealthUtils";
import { useSystemHealth } from "./hooks/useSystemHealth";
import { DependencyBadge } from "./components/DependencyBadge";
import { StatusBadge } from "./components/StatusBadge";
import { ServicesTable } from "./components/ServicesTable";
import { MetricsSection } from "./components/MetricsSection";
import "./SystemHealthPage.css";

export default function SystemHealthPage() {
  const {
    serviceSnapshots,
    selectedService,
    selectedServiceId,
    setSelectedServiceId,
    selectedSnapshot,
    metrics,
    refreshHealth,
    refreshMetrics,
    lastRefresh,
    okCount,
    loadingCount,
    errorCount,
    failedDependencyCount,
    isRefreshing,
    initialHealthLoading,
  } = useSystemHealth();

  const liveReport = selectedSnapshot.live?.data;
  const readyReport = selectedSnapshot.ready?.data;
  const memory = liveReport?.memory;
  const dependencyChecks = readyReport?.checks ?? [];
  const showSelectedHealthSkeleton =
    initialHealthLoading && !selectedSnapshot.lastChecked;

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

      <ServicesTable
        serviceSnapshots={serviceSnapshots}
        selectedServiceId={selectedServiceId}
        onSelect={setSelectedServiceId}
        initialHealthLoading={initialHealthLoading}
      />

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

      <MetricsSection
        selectedService={selectedService}
        metrics={metrics}
        onReload={refreshMetrics}
      />
    </div>
  );
}
