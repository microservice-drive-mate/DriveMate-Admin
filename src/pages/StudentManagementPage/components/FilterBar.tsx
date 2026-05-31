import type { LicenseTier } from "@/types/user-profile.types";
import {
	STUDENT_LICENSE_TIERS,
	STUDENT_STATUS_OPTIONS,
	type StudentFilters,
} from "@/types/student.types";

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
				<span>âŒ•</span>
				<input
					value={filters.search}
					onChange={(e) => update({ search: e.target.value })}
					placeholder="TÃ¬m kiáº¿m theo tÃªn, email, SÄT..."
				/>
			</div>

			<select
				value={filters.licenseTier}
				onChange={(e) =>
					update({
						licenseTier: e.target.value as LicenseTier | "",
					})
				}>
				<option value="">Háº¡ng báº±ng</option>
				{STUDENT_LICENSE_TIERS.map((tier) => (
					<option
						key={tier}
						value={tier}>
						{tier}
					</option>
				))}
			</select>

			<select
				value={filters.status}
				onChange={(e) =>
					update({
						status: e.target.value as StudentFilters["status"],
					})
				}>
				<option value="">Tráº¡ng thÃ¡i</option>
				{STUDENT_STATUS_OPTIONS.map((item) => (
					<option
						key={item.value}
						value={item.value}
						disabled={item.value === "warning" || item.value === "completed"}>
						{item.value === "warning" || item.value === "completed"
							? `${item.label} (chÆ°a há»— trá»£)`
							: item.label}
					</option>
				))}
			</select>

			<button
				className="student-filters__clear"
				onClick={() =>
					onChange({ search: "", licenseTier: "", status: "" })
				}>
				âŠ˜ Lá»c
			</button>
		</div>
	);
}
