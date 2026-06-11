import type { LicenseTier } from "@/types/user-profile.types";
import {
	STUDENT_LICENSE_TIERS,
	STUDENT_STATUS_OPTIONS,
	type StudentFilters,
} from "@/types/student.types";
import { FilterSelect } from "@/components/ui/FilterSelect";

interface FilterBarProps {
	filters: StudentFilters;
	onChange: (next: StudentFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
	const update = (patch: Partial<StudentFilters>) =>
		onChange({ ...filters, ...patch });

	return (
		<div className="student-filters">
			<div className="student-filters__search">
				<span>⌕</span>
				<input
					value={filters.search}
					onChange={(e) => update({ search: e.target.value })}
					placeholder="Tìm kiếm theo tên, email, SĐT..."
				/>
			</div>

			<FilterSelect
				value={filters.licenseTier}
				onChange={(v) => update({ licenseTier: v as LicenseTier | "" })}
				placeholder="Hạng bằng"
				options={STUDENT_LICENSE_TIERS.map((tier) => ({
					value: tier,
					label: tier,
				}))}
			/>

			<FilterSelect
				value={filters.status}
				onChange={(v) => update({ status: v as StudentFilters["status"] })}
				placeholder="Trạng thái"
				options={STUDENT_STATUS_OPTIONS.map((item) => {
					const unsupported =
						item.value === "warning" || item.value === "completed";
					return {
						value: item.value,
						label: unsupported ? `${item.label} (chưa hỗ trợ)` : item.label,
						disabled: unsupported,
					};
				})}
			/>

			<button
				className="student-filters__clear"
				onClick={() =>
					onChange({ search: "", licenseTier: "", status: "" })
				}>
				⊘ Lọc
			</button>
		</div>
	);
}
