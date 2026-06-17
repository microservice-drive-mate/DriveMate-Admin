import "./Avatar.css"

interface AvatarProps {
	initials: string
	size?: "sm" | "md" | "lg"
	bg?: string
	color?: string
}

export function Avatar({ initials, size = "md", bg, color }: AvatarProps) {
	return (
		<div
			className={`avatar avatar--${size}`}
			style={{ background: bg, color }}
		>
			{initials}
		</div>
	)
}
