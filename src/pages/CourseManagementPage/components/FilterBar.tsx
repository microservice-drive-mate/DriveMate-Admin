import type { CourseFilters, CourseStatus, LicenseCategory } from "@/types/course.types";
import {
	COURSE_LICENSE_CATEGORIES,
	COURSE_STATUS_OPTIONS,
} from "@/types/course.types";
import { FilterSelect } from "@/components/ui/FilterSelect";

interface FilterBarProps {
	filters: CourseFilters;
	onChange: (next: CourseFilters) => void;
	lockedLicenseCategory?: LicenseCategory | "";
}

export function FilterBar({
	filters,
	onChange,
	lockedLicenseCategory = "",
}: FilterBarProps) {
	const update = (patch: Partial<CourseFilters>) => onChange({ ...filters, ...patch });
	const licenseValue = lockedLicenseCategory || filters.licenseCategory;

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
					placeholder="Tìm kiếm khóa học..."
				/>
			</div>

			<FilterSelect
				value={licenseValue}
				disabled={Boolean(lockedLicenseCategory)}
				onChange={(v) => update({ licenseCategory: v as LicenseCategory | "" })}
				placeholder="Tất cả hạng"
				options={COURSE_LICENSE_CATEGORIES.map((cls) => ({ value: cls, label: cls }))}
			/>

			<FilterSelect
				value={filters.status}
				onChange={(v) => update({ status: v as CourseStatus | "" })}
				placeholder="Tất cả"
				options={COURSE_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
			/>

			<button
				className="course-filters__reset"
				onClick={() =>
					onChange({
						search: "",
						licenseCategory: lockedLicenseCategory || "",
						status: "",
					})
				}
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M3 6h18M6 6V4h12v2M19 6l-1 14H6L5 6" />
				</svg>
				Đặt lại
			</button>
		</div>
	);
}
