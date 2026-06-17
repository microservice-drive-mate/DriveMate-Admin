import type { IdentityUser } from "@/types/identity.types"

interface InstructorPickerProps {
	isEdit: boolean
	instructors: IdentityUser[]
	value: string[]
	onChange: (next: string[]) => void
	search: string
	onSearchChange: (next: string) => void
}

export function InstructorPicker({
	isEdit,
	instructors,
	value,
	onChange,
	search,
	onSearchChange,
}: InstructorPickerProps) {
	if (isEdit) {
		return (
			<div className="add-course__instructor-tags">
				{value.length === 0 ? (
					<span className="add-course__hint">
						Không có giảng viên nào được gán.
					</span>
				) : (
					value.map((id) => {
						const found = instructors.find((i) => i.userId === id)
						return (
							<span
								key={id}
								className="add-course__instructor-tag"
							>
								{found ? found.fullName : id.slice(0, 8)}
							</span>
						)
					})
				)}
			</div>
		)
	}

	return (
		<>
			<input
				className="add-course__instructor-search"
				placeholder="Tìm theo tên hoặc email..."
				value={search}
				onChange={(e) => onSearchChange(e.target.value)}
			/>
			<div className="add-course__instructor-list">
				{instructors
					.filter((i) => {
						const q = search.toLowerCase()
						return (
							!q ||
							i.fullName.toLowerCase().includes(q) ||
							i.email.toLowerCase().includes(q)
						)
					})
					.map((i) => (
						<label
							key={i.userId}
							className="add-course__instructor-option"
						>
							<input
								type="checkbox"
								checked={value.includes(i.userId)}
								onChange={(e) => {
									const next = e.target.checked
										? [...value, i.userId]
										: value.filter((id) => id !== i.userId)
									onChange(next)
								}}
							/>
							<span className="add-course__instructor-name">
								{i.fullName}
							</span>
							<span className="add-course__instructor-email">
								{i.email}
							</span>
						</label>
					))}
				{instructors.length === 0 && (
					<span className="add-course__hint">
						Đang tải danh sách giảng viên...
					</span>
				)}
			</div>
		</>
	)
}
