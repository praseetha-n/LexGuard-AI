import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import AuthLayout from './AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    const result = await resetPassword(email.trim());

    setIsSubmitting(false);

    if (result.success) {
      setSuccess('Password reset link has been sent to your email address.');
    } else {
      setError(result.error || 'Unable to send password reset link.');
    }
  };

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email to receive a password reset link"
    >
      {error && (
        <div className="auth-alert auth-alert--error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-alert auth-alert--success" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="resetEmail">Email Address</label>
          <input
            id="resetEmail"
            type="email"
            className="auth-input"
            placeholder="counsel@lawfirm.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="btn-spinner-wrapper">
              <span className="btn-spinner" aria-hidden="true" />
              <span>Sending Link...</span>
            </span>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <div className="auth-footer-links">
        <Link to="/login" className="auth-link">
          ← Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}
