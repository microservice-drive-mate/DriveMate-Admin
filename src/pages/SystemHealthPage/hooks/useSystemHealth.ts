import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { HEALTH_SERVICE_DEFINITIONS, healthMetricsService } from "@/services"
import {
	POLL_INTERVAL_MS,
	countFailedDependencies,
	createInitialSnapshots,
	getServiceStatus,
	parsePrometheusMetrics,
	type MetricsState,
	type ServiceSnapshot,
} from "../systemHealthUtils"

/**
 * Quản lý toàn bộ phần dữ liệu của trang System Health: poll liveness/readiness
 * cho từng service, nạp Prometheus metrics theo service đang chọn, và tính các số
 * liệu tổng hợp. Component chỉ còn lo phần hiển thị.
 */
export function useSystemHealth() {
	const [snapshots, setSnapshots] = useState<Record<string, ServiceSnapshot>>(
		createInitialSnapshots,
	)
	const [lastRefresh, setLastRefresh] = useState<string>()
	const [selectedServiceId, setSelectedServiceId] = useState(
		HEALTH_SERVICE_DEFINITIONS[0].id,
	)
	const [metrics, setMetrics] = useState<MetricsState>({
		loading: false,
		raw: "",
		parsed: [],
		error: "",
		serviceId: undefined,
	})
	const healthRequestRef = useRef(0)
	const metricsRequestRef = useRef(0)

	const selectedService = useMemo(
		() =>
			HEALTH_SERVICE_DEFINITIONS.find(
				(service) => service.id === selectedServiceId,
			) ?? HEALTH_SERVICE_DEFINITIONS[0],
		[selectedServiceId],
	)

	const serviceSnapshots = HEALTH_SERVICE_DEFINITIONS.map(
		(service) => snapshots[service.id] ?? { service, loading: true },
	)
	const selectedSnapshot = snapshots[selectedService.id] ?? {
		service: selectedService,
		loading: true,
	}

	const refreshHealth = useCallback(async () => {
		const requestId = healthRequestRef.current + 1
		healthRequestRef.current = requestId

		setSnapshots((current) => {
			const next = { ...current }
			HEALTH_SERVICE_DEFINITIONS.forEach((service) => {
				next[service.id] = {
					...(current[service.id] ?? { service }),
					service,
					loading: true,
				}
			})
			return next
		})

		const checkedAt = new Date().toISOString()
		const results = await Promise.all(
			HEALTH_SERVICE_DEFINITIONS.map(async (service) => {
				const [live, ready] = await Promise.all([
					healthMetricsService.getLiveness(service),
					healthMetricsService.getReadiness(service),
				])
				return { service, live, ready }
			}),
		)

		if (healthRequestRef.current !== requestId) return

		setSnapshots((current) => {
			const next = { ...current }
			results.forEach(({ service, live, ready }) => {
				next[service.id] = {
					service,
					live,
					ready,
					loading: false,
					lastChecked: checkedAt,
				}
			})
			return next
		})
		setLastRefresh(checkedAt)
	}, [])

	const refreshMetrics = useCallback(async () => {
		const requestId = metricsRequestRef.current + 1
		metricsRequestRef.current = requestId

		setMetrics((current) => ({
			...(current.serviceId === selectedService.id
				? current
				: { raw: "", parsed: [] }),
			loading: true,
			error: "",
			status: undefined,
			serviceId: selectedService.id,
		}))

		const result = await healthMetricsService.getMetrics(selectedService)
		if (metricsRequestRef.current !== requestId) return

		if (result.ok) {
			setMetrics({
				loading: false,
				raw: result.data,
				parsed: parsePrometheusMetrics(result.data),
				error: "",
				status: result.status,
				serviceId: selectedService.id,
			})
			return
		}

		setMetrics({
			loading: false,
			raw: result.data ?? "",
			parsed: result.data ? parsePrometheusMetrics(result.data) : [],
			error: result.message,
			status: result.status,
			serviceId: selectedService.id,
		})
	}, [selectedService])

	useEffect(() => {
		const initialRefreshId = window.setTimeout(refreshHealth, 0)
		const intervalId = window.setInterval(refreshHealth, POLL_INTERVAL_MS)
		return () => {
			window.clearTimeout(initialRefreshId)
			window.clearInterval(intervalId)
		}
	}, [refreshHealth])

	useEffect(() => {
		const initialRefreshId = window.setTimeout(refreshMetrics, 0)
		return () => window.clearTimeout(initialRefreshId)
	}, [refreshMetrics])

	const okCount = serviceSnapshots.filter(
		(snapshot) => getServiceStatus(snapshot) === "ok",
	).length
	const loadingCount = serviceSnapshots.filter(
		(snapshot) => getServiceStatus(snapshot) === "loading",
	).length
	const errorCount = serviceSnapshots.length - okCount - loadingCount
	const failedDependencyCount = serviceSnapshots.reduce(
		(total, snapshot) => total + countFailedDependencies(snapshot),
		0,
	)
	const isRefreshing = serviceSnapshots.some((snapshot) => snapshot.loading)
	const initialHealthLoading = !lastRefresh && isRefreshing

	return {
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
	}
}
