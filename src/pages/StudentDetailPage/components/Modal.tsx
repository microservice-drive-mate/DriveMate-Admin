import type { ReactNode } from "react"

interface ModalProps {
	title: string
	children: ReactNode
	onClose: () => void
	footer?: ReactNode
}

export function Modal({ title, children, onClose, footer }: ModalProps) {
	return (
		<div className="detail-modal__backdrop" onClick={onClose}>
			<div className="detail-modal" onClick={(e) => e.stopPropagation()}>
				<div className="detail-modal__title">{title}</div>
				{children}
				{footer}
			</div>
		</div>
	)
}
