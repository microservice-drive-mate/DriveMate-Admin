import "./ErrorMessage.css"

interface ErrorMessageProps {
	message: string | null | undefined
}

export function ErrorMessage({ message }: ErrorMessageProps) {
	if (!message) return null
	return <div className="error-message">{message}</div>
}
