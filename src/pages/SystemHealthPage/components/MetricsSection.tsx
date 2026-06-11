import { Skeleton } from "@/components/ui/Skeleton";
import type { HealthServiceDefinition } from "@/types";
import { IMPORTANT_METRIC_LABELS, type MetricsState } from "../systemHealthUtils";

interface MetricsSectionProps {
  selectedService: HealthServiceDefinition;
  metrics: MetricsState;
  onReload: () => void;
}

export function MetricsSection({
  selectedService,
  metrics,
  onReload,
}: MetricsSectionProps) {
  const metricsBelongToSelectedService = metrics.serviceId === selectedService.id;
  const showMetricsSkeleton =
    !metricsBelongToSelectedService ||
    (metrics.loading &&
      metrics.raw === "" &&
      metrics.parsed.length === 0 &&
      !metrics.error);

  return (
    <section className="system-health-section">
      <div className="system-health-section__header">
        <div>
          <h2>Metrics</h2>
          <span>Prometheus metrics for /{selectedService.prefix}/metrics</span>
        </div>
        <button
          type="button"
          onClick={onReload}
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
  );
}
