import type { ReactNode } from "react"

interface InlineButtonProps {
	children: ReactNode
	tone: "yellow" | "green" | "red"
	onClick: () => void
	disabled?: boolean
}

export function InlineButton({
	children,
	tone,
	onClick,
	disabled,
}: InlineButtonProps) {
	return (
		<button
			className={`detail-action detail-action--${tone}`}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	)
}
