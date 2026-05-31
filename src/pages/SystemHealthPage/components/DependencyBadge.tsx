interface DependencyBadgeProps {
	status: string;
}

export function DependencyBadge({ status }: DependencyBadgeProps) {
	const normalized = status === "ok" || status === "skipped" ? status : "error";

	return (
		<span className={`system-health-dependency__badge system-health-dependency__badge--${normalized}`}>
			{status}
		</span>
	);
}
