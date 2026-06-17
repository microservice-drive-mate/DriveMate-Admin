import type { ReactNode } from "react"

interface FieldProps {
	label: string
	children: ReactNode
	error?: string
}

export function Field({ label, children, error }: FieldProps) {
	return (
		<div className="add-student__field">
			<label>{label}</label>
			{children}
			{error && <span className="add-student__error">{error}</span>}
		</div>
	)
}
