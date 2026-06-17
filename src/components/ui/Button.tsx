import "./Button.css"
import type { ButtonVariant } from "../../types"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	loading?: boolean
	loadingLabel?: string
	fullWidth?: boolean
}

export function Button({
	variant = "primary",
	loading = false,
	loadingLabel,
	fullWidth = false,
	children,
	disabled,
	className,
	...rest
}: ButtonProps) {
	const classes = [
		"btn",
		`btn--${variant}`,
		fullWidth ? "btn--full" : "",
		className ?? "",
	]
		.filter(Boolean)
		.join(" ")

	return (
		<button {...rest} className={classes} disabled={disabled || loading}>
			{loading && loadingLabel ? loadingLabel : children}
		</button>
	)
}
