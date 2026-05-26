import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { validateEmail } from '../utils/authUtils';
import { SRS_MESSAGES } from '../utils/srsMessages';
import { FormGroup } from '../components/ui/FormGroup';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';
import './ForgotPasswordPage.css';

export function ForgotPasswordStep1() {
  const { requestPasswordReset, loading, error: storeError, passwordResetEmailSent, clearError, clearPasswordResetStatus } = useAuthStore();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    return () => {
      clearError();
      clearPasswordResetStatus();
    };
  }, [clearError, clearPasswordResetStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim() || !validateEmail(email)) {
      setLocalError(SRS_MESSAGES.MSG04);
      return;
    }

    await requestPasswordReset(email);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <div className="logo-icon">🎓</div>
          <h2>Forgot Password</h2>
          <p>Enter your email to receive a password reset link.</p>
        </div>

        {passwordResetEmailSent ? (
          <div className="forgot-password-form">
            <div className="forgot-password-success">
              ✓ If an account exists for <strong>{email}</strong>, a password reset link has been sent. Please check your inbox.
            </div>
            <Link to="/login" className="btn btn--secondary">
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <FormGroup label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@drivingschool.vn"
                disabled={loading}
              />
            </FormGroup>

            <ErrorMessage message={localError || storeError} />

            <Button type="submit" fullWidth loading={loading} loadingLabel="Sending...">
              Send reset link
            </Button>

            <Link to="/login" className="btn btn--secondary">
              ← Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
