import type { LicenseCategory } from "@/types/question.types";

interface LicenseCategoryBadgesProps {
	categories?: LicenseCategory[];
}

export function LicenseCategoryBadges({ categories }: LicenseCategoryBadgesProps) {
	const visibleCategories = categories ?? [];
	const tooltipLabel = visibleCategories.join(", ");

	if (!visibleCategories.length) {
		return <span className="q-class-empty">-</span>;
	}

	if (visibleCategories.length <= 2) {
		return (
			<div className="q-class-list" aria-label={`Hang: ${tooltipLabel}`}>
				{visibleCategories.map((category) => (
					<span key={category} className="q-class-badge">{category}</span>
				))}
			</div>
		);
	}

	return (
		<div className="q-class-list q-class-list--compact">
			<span className="q-class-tooltip" tabIndex={0} aria-label={`Hang: ${tooltipLabel}`}>
				<span className="q-class-badge q-class-badge--more">+{visibleCategories.length}</span>
				<span className="q-class-tooltip__content" role="tooltip">
					{visibleCategories.map((category) => (
						<span key={category} className="q-class-badge">{category}</span>
					))}
				</span>
			</span>
		</div>
	);
}
