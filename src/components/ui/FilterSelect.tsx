export interface FilterOption {
	value: string
	label: string
	disabled?: boolean
}

interface FilterSelectProps {
	value: string
	onChange: (value: string) => void
	/** Nhãn cho option rỗng đầu danh sách (value=""). */
	placeholder: string
	options: FilterOption[]
	disabled?: boolean
	className?: string
}

/**
 * Select lọc dùng chung cho các FilterBar: option rỗng (placeholder) + danh sách
 * option. Không tự thêm class wrapper nên vẫn ăn CSS scoped của từng trang
 * (`.q-filters select`, `.student-filters select`, ...).
 */
export function FilterSelect({
	value,
	onChange,
	placeholder,
	options,
	disabled,
	className,
}: FilterSelectProps) {
	return (
		<select
			className={className}
			value={value}
			disabled={disabled}
			onChange={(e) => onChange(e.target.value)}
		>
			<option value="">{placeholder}</option>
			{options.map((option) => (
				<option
					key={option.value}
					value={option.value}
					disabled={option.disabled}
				>
					{option.label}
				</option>
			))}
		</select>
	)
}
