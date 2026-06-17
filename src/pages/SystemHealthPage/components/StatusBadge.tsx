import type { ServiceStatus } from "../systemHealthUtils"

interface StatusBadgeProps {
	status: ServiceStatus
	label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
	return (
		<span
			className={`system-health-status system-health-status--${status}`}
		>
			{label ??
				(status === "ok"
					? "OK"
					: status === "loading"
						? "Loading"
						: "Error")}
		</span>
	)
}
