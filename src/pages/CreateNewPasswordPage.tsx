import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  validatePassword,
  validatePasswordMatch,
} from '../utils/authUtils';
import './ForgotPasswordPage.css';

export function CreateNewPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword, resetOtpVerified, error: storeError, clearError } = useAuthStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordValidation = validatePassword(newPassword);
  const passwordsMatch = validatePasswordMatch(newPassword, confirmPassword);

  useEffect(() => {
    // If OTP not verified, redirect back
    if (!resetOtpVerified) {
      navigate('/forgot-password/step1', { replace: true });
    }
  }, [resetOtpVerified, navigate]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim()) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (!confirmPassword.trim()) {
      setError('Vui lòng xác nhận mật khẩu');
      return;
    }

    if (!passwordsMatch) {
      setError('Mật khẩu không khớp');
      return;
    }

    setLoading(true);

    // Simulate password reset
    setTimeout(() => {
      resetPassword(newPassword);
      // Redirect to login after success
      navigate('/login', { replace: true });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card large">
        <div className="forgot-password-header">
          <div className="logo-icon">🎓</div>
          <h2>Tạo Mật Khẩu Mới</h2>
          <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {newPassword && (
            <div className="password-validation">
              <div className={`validation-item ${passwordValidation.minLength ? 'valid' : 'invalid'}`}>
                ✓ Ít nhất 8 ký tự
              </div>
              <div className={`validation-item ${(passwordValidation.hasUpperCase && passwordValidation.hasLowerCase) ? 'valid' : 'invalid'}`}>
                ✓ Bao gồm chữ hoa và chữ thường
              </div>
              <div className={`validation-item ${passwordValidation.hasNumber ? 'valid' : 'invalid'}`}>
                ✓ Có ít nhất 1 số
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="toggle-password"
                disabled={loading}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <small className="help-text error-text">
                ✗ Mật khẩu không khớp
              </small>
            )}
            {confirmPassword && passwordsMatch && (
              <small className="help-text success-text">
                ✓ Mật khẩu khớp
              </small>
            )}
          </div>

          {(error || storeError) && (
            <div className="error-message">{error || storeError}</div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={loading || !passwordValidation.isValid || !passwordsMatch}
          >
            {loading ? 'Đang đặt lại mật khẩu...' : 'Đặt Lại Mật Khẩu'}
          </button>

        </form>
      </div>
    </div>
  );
}
