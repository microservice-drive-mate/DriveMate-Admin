import { usePasswordVisibility } from "../../hooks/usePasswordVisibility"
import { FormGroup } from "./FormGroup"

interface PasswordInputProps {
	label: string
	value: string
	onChange: (value: string) => void
	placeholder?: string
	disabled?: boolean
	helpText?: string
	helpTextVariant?: "default" | "error" | "success"
}

export function PasswordInput({
	label,
	value,
	onChange,
	placeholder = "••••••••",
	disabled,
	helpText,
	helpTextVariant,
}: PasswordInputProps) {
	const { isVisible, toggle, inputType } = usePasswordVisibility()

	return (
		<FormGroup
			label={label}
			helpText={helpText}
			helpTextVariant={helpTextVariant}
		>
			<div className="password-input-wrapper">
				<input
					type={inputType}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					disabled={disabled}
				/>
				<button
					type="button"
					onClick={toggle}
					className="toggle-password"
					disabled={disabled}
				>
					{isVisible ? "🙈" : "👁️"}
				</button>
			</div>
		</FormGroup>
	)
}
