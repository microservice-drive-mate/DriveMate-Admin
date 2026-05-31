import type { CourseFilters, CourseStatus, LicenseCategory } from "@/types/course.types";
import {
	COURSE_LICENSE_CATEGORIES,
	COURSE_STATUS_OPTIONS,
} from "@/types/course.types";

interface FilterBarProps {
	filters: CourseFilters;
	onChange: (next: CourseFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
	const update = (patch: Partial<CourseFilters>) => onChange({ ...filters, ...patch });

	return (
		<div className="course-filters">
			<div className="course-filters__search">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<input
					value={filters.search}
					onChange={(e) => update({ search: e.target.value })}
					placeholder="TÃ¬m kiáº¿m khÃ³a há»c..."
				/>
			</div>

			<select value={filters.licenseCategory} onChange={(e) => update({ licenseCategory: e.target.value as LicenseCategory | "" })}>
				<option value="">Táº¥t cáº£ háº¡ng</option>
				{COURSE_LICENSE_CATEGORIES.map((cls) => (
					<option key={cls} value={cls}>{cls}</option>
				))}
			</select>

			<select value={filters.status} onChange={(e) => update({ status: e.target.value as CourseStatus | "" })}>
				<option value="">Táº¥t cáº£</option>
				{COURSE_STATUS_OPTIONS.map((opt) => (
					<option key={opt.value} value={opt.value}>{opt.label}</option>
				))}
			</select>

			<button
				className="course-filters__reset"
				onClick={() => onChange({ search: "", licenseCategory: "", status: "" })}
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M3 6h18M6 6V4h12v2M19 6l-1 14H6L5 6" />
				</svg>
				Äáº·t láº¡i
			</button>
		</div>
	);
}
