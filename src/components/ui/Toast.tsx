import { useEffect } from "react"
import "./Toast.css"

interface ToastProps {
	message: string
	type?: "success" | "error"
	visible: boolean
	onClose: () => void
}

export default function Toast({
	message,
	type = "success",
	visible,
	onClose,
}: ToastProps) {
	useEffect(() => {
		if (!visible) return
		const timer = setTimeout(onClose, 3000)
		return () => clearTimeout(timer)
	}, [visible, onClose])

	if (!visible) return null

	return (
		<div className={`toast toast--${type}`}>
			<span className="toast__icon">
				{type === "success" ? "✓" : "✕"}
			</span>
			<span className="toast__message">{message}</span>
			<button className="toast__close" onClick={onClose}>
				×
			</button>
		</div>
	)
}
