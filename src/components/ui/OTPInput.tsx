import "./OTPInput.css"

interface OTPInputProps {
	digits: string[]
	inputRefs: React.RefObject<(HTMLInputElement | null)[]>
	onChange: (index: number, value: string) => void
	onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
	onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
	disabled?: boolean
}

export function OTPInput({
	digits,
	inputRefs,
	onChange,
	onKeyDown,
	onPaste,
	disabled,
}: OTPInputProps) {
	return (
		<div className="otp-boxes">
			{digits.map((digit, index) => (
				<input
					key={index}
					ref={(el) => {
						inputRefs.current[index] = el
					}}
					type="text"
					inputMode="numeric"
					pattern="\d*"
					maxLength={1}
					value={digit}
					onChange={(e) => onChange(index, e.target.value)}
					onKeyDown={(e) => onKeyDown(index, e)}
					onPaste={onPaste}
					disabled={disabled}
					className={`otp-box${digit ? " filled" : ""}`}
					autoFocus={index === 0}
				/>
			))}
		</div>
	)
}
