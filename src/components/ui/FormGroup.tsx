import "./FormGroup.css"

interface FormGroupProps {
	label: string
	children: React.ReactNode
	helpText?: string
	helpTextVariant?: "default" | "error" | "success"
}

export function FormGroup({
	label,
	children,
	helpText,
	helpTextVariant = "default",
}: FormGroupProps) {
	return (
		<div className="form-group">
			<label>{label}</label>
			{children}
			{helpText && (
				<small
					className={`form-group__help form-group__help--${helpTextVariant}`}
				>
					{helpText}
				</small>
			)}
		</div>
	)
}
