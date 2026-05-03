import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { validateEmail } from "../utils/authUtils";
import "./LoginPage.css";

export function LoginPage() {
	const navigate = useNavigate();
	const { login, isAuthenticated, loading, error, clearError } =
		useAuthStore();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [localError, setLocalError] = useState("");

	useEffect(() => {
		// If already authenticated, redirect to dashboard
		if (isAuthenticated) {
			navigate("/dashboard", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		return () => {
			clearError();
		};
	}, [clearError]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setLocalError("");

		// Validation
		if (!email.trim()) {
			setLocalError("Vui lòng nhập email");
			return;
		}

		if (!validateEmail(email)) {
			setLocalError("Email không hợp lệ");
			return;
		}

		if (!password.trim()) {
			setLocalError("Vui lòng nhập mật khẩu");
			return;
		}

		// Call login action
		login({ email, password });
	};

	return (
		<div className="login-container">
			<div className="login-card">
				<div className="login-header">
					<div className="logo-icon">🎓</div>
					<h1>Driving School</h1>
					<p>Hệ Thống Quản Lý Luyện Thi</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="login-form">
					<div className="form-group">
						<label>Email</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="admin@drivingschool.vn"
							disabled={loading}
						/>
					</div>

					<div className="form-group">
						<label>Mật khẩu</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							disabled={loading}
						/>
					</div>

					{(localError || error) && (
						<div className="error-message">
							{localError || error}
						</div>
					)}

					<div className="form-footer">
						<label className="remember-me">
							<input
								type="checkbox"
								disabled={loading}
							/>
							<span>Ghi nhớ đăng nhập</span>
						</label>
						<Link
							to="/forgot-password/step1"
							className="forgot-password-link">
							Quên mật khẩu?
						</Link>
					</div>

					<button
						type="submit"
						className="login-button"
						disabled={loading}>
						{loading ? "Đang đăng nhập..." : "Đăng Nhập"}
					</button>
				</form>

				<p className="login-footer">
					© 2026 Driving School. All rights reserved.
				</p>
			</div>
		</div>
	);
}
