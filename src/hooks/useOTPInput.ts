import { useState, useRef } from "react"

export function useOTPInput(length = 6) {
	const [digits, setDigits] = useState<string[]>(Array(length).fill(""))
	const inputRefs = useRef<(HTMLInputElement | null)[]>([])

	const handleChange = (index: number, value: string) => {
		const digit = value.replace(/\D/g, "").slice(-1)
		const newDigits = [...digits]
		newDigits[index] = digit
		setDigits(newDigits)
		if (digit && index < length - 1) {
			inputRefs.current[index + 1]?.focus()
		}
	}

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Backspace" && !digits[index] && index > 0) {
			inputRefs.current[index - 1]?.focus()
		}
		if (e.key === "ArrowLeft" && index > 0) {
			inputRefs.current[index - 1]?.focus()
		}
		if (e.key === "ArrowRight" && index < length - 1) {
			inputRefs.current[index + 1]?.focus()
		}
	}

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault()
		const pasted = e.clipboardData
			.getData("text")
			.replace(/\D/g, "")
			.slice(0, length)
		if (!pasted) return
		const newDigits = Array(length).fill("")
		for (let i = 0; i < pasted.length; i++) {
			newDigits[i] = pasted[i]
		}
		setDigits(newDigits)
		const focusIndex = Math.min(pasted.length, length - 1)
		inputRefs.current[focusIndex]?.focus()
	}

	const reset = () => setDigits(Array(length).fill(""))

	return {
		digits,
		otp: digits.join(""),
		inputRefs,
		handleChange,
		handleKeyDown,
		handlePaste,
		reset,
	}
}
