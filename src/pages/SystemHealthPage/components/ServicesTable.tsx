import { HEALTH_SERVICE_DEFINITIONS } from "@/services"
import { Skeleton } from "@/components/ui/Skeleton"
import {
	countFailedDependencies,
	formatBytes,
	formatDateTime,
	formatDuration,
	getEndpointStatus,
	type ServiceSnapshot,
} from "../systemHealthUtils"
import { StatusBadge } from "./StatusBadge"

interface ServicesTableProps {
	serviceSnapshots: ServiceSnapshot[]
	selectedServiceId: string
	onSelect: (serviceId: string) => void
	initialHealthLoading: boolean
}

export function ServicesTable({
	serviceSnapshots,
	selectedServiceId,
	onSelect,
	initialHealthLoading,
}: ServicesTableProps) {
	return (
		<section className="system-health-section">
			<div className="system-health-section__header">
				<h2>Services</h2>
				<span>
					{HEALTH_SERVICE_DEFINITIONS.length} monitored services
				</span>
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
						{initialHealthLoading
							? HEALTH_SERVICE_DEFINITIONS.map((service) => (
									<tr
										className="system-health-table__row"
										key={service.id}
									>
										<td>
											<div className="system-health-service-skeleton">
												<Skeleton
													variant="text"
													width={96}
													height={14}
												/>
												<Skeleton
													variant="text"
													width={146}
													height={12}
												/>
											</div>
										</td>
										<td>
											<Skeleton width={72} height={24} />
										</td>
										<td>
											<Skeleton width={72} height={24} />
										</td>
										<td>
											<Skeleton
												variant="text"
												width={52}
												height={14}
											/>
										</td>
										<td>
											<Skeleton
												variant="text"
												width={118}
												height={14}
											/>
										</td>
										<td>
											<Skeleton
												variant="text"
												width={64}
												height={14}
											/>
										</td>
										<td>
											<Skeleton
												variant="text"
												width={132}
												height={14}
											/>
										</td>
									</tr>
								))
							: serviceSnapshots.map((snapshot) => {
									const liveStatus = getEndpointStatus(
										snapshot.live,
										snapshot.loading,
									)
									const readyStatus = getEndpointStatus(
										snapshot.ready,
										snapshot.loading,
									)
									const checks =
										snapshot.ready?.data?.checks ?? []
									const failedChecks =
										countFailedDependencies(snapshot)
									const serviceMemory =
										snapshot.live?.data?.memory

									return (
										<tr
											key={snapshot.service.id}
											className={
												selectedServiceId ===
												snapshot.service.id
													? "system-health-table__row system-health-table__row--selected"
													: "system-health-table__row"
											}
										>
											<td>
												<button
													type="button"
													className="system-health-service-button"
													onClick={() =>
														onSelect(
															snapshot.service.id,
														)
													}
												>
													<span>
														{snapshot.service.label}
													</span>
													<small>
														/
														{
															snapshot.service
																.prefix
														}
													</small>
												</button>
											</td>
											<td>
												<StatusBadge
													status={liveStatus}
												/>
											</td>
											<td>
												<StatusBadge
													status={readyStatus}
												/>
											</td>
											<td>
												{formatDuration(
													snapshot.live?.data
														?.uptimeSeconds,
												)}
											</td>
											<td>
												{formatBytes(
													serviceMemory?.heapUsed,
												)}{" "}
												/{" "}
												{formatBytes(
													serviceMemory?.heapTotal,
												)}
											</td>
											<td>
												{checks.length === 0
													? "-"
													: `${checks.length - failedChecks}/${checks.length} OK`}
											</td>
											<td>
												{formatDateTime(
													snapshot.lastChecked,
												)}
											</td>
										</tr>
									)
								})}
					</tbody>
				</table>
			</div>
		</section>
	)
}
