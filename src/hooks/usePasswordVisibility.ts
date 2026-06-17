import { useState } from "react"

export function usePasswordVisibility(initialVisible = false) {
	const [isVisible, setIsVisible] = useState(initialVisible)

	return {
		isVisible,
		toggle: () => setIsVisible((v) => !v),
		inputType: isVisible ? ("text" as const) : ("password" as const),
	}
}
