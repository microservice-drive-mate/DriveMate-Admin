import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { validateOTP } from "../utils/authUtils";
import "./ForgotPasswordPage.css";

export function ForgotPasswordStep2() {
	const navigate = useNavigate();
	const { verifyOTP, resetEmail } = useAuthStore();
	const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const otp = otpDigits.join("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!resetEmail) {
			navigate("/forgot-password/step1", { replace: true });
		}
	}, [resetEmail, navigate]);

	const handleDigitChange = (index: number, value: string) => {
		const digit = value.replace(/\D/g, "").slice(-1);
		const newDigits = [...otpDigits];
		newDigits[index] = digit;
		setOtpDigits(newDigits);
		if (digit && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleDigitKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
		if (e.key === "ArrowLeft" && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
		if (e.key === "ArrowRight" && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pasted = e.clipboardData
			.getData("text")
			.replace(/\D/g, "")
			.slice(0, 6);
		if (!pasted) return;
		const newDigits = ["", "", "", "", "", ""];
		for (let i = 0; i < pasted.length; i++) {
			newDigits[i] = pasted[i];
		}
		setOtpDigits(newDigits);
		const focusIndex = Math.min(pasted.length, 5);
		inputRefs.current[focusIndex]?.focus();
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!validateOTP(otp)) {
			setError("Vui lòng nhập 6 chữ số OTP");
			return;
		}

		setLoading(true);

		// Simulate OTP verification
		setTimeout(() => {
			const isValid = verifyOTP(otp);
			if (isValid) {
				navigate("/forgot-password/step3");
			} else {
				setError("OTP không đúng. Vui lòng thử lại.");
			}
			setLoading(false);
		}, 1000);
	};

	return (
		<div className="forgot-password-container">
			<div className="forgot-password-card">
				<div className="forgot-password-header">
					<div className="logo-icon">🎓</div>
					<h2>Quên Mật Khẩu</h2>
					<p>
						Nếu email đã đăng ký, OTP đã được gửi đến email của bạn.
						Vui lòng check inbox
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="forgot-password-form">
					<div className="otp-boxes">
						{otpDigits.map((digit, index) => (
							<input
								key={index}
								ref={(el) => {
									inputRefs.current[index] = el;
								}}
								type="text"
								inputMode="numeric"
								pattern="\d*"
								maxLength={1}
								value={digit}
								onChange={(e) =>
									handleDigitChange(index, e.target.value)
								}
								onKeyDown={(e) => handleDigitKeyDown(index, e)}
								onPaste={handleDigitPaste}
								disabled={loading}
								className={`otp-box${digit ? " filled" : ""}`}
								autoFocus={index === 0}
							/>
						))}
					</div>

					{error && <div className="error-message">{error}</div>}

					<button
						type="submit"
						className="submit-button"
						disabled={loading || otp.length !== 6}>
						{loading ? "Đang xác nhận..." : "Gửi OTP"}
					</button>

					<Link
						to="/forgot-password/step1"
						className="back-button">
						← Quay lại Đăng nhập
					</Link>
				</form>
			</div>
		</div>
	);
}
