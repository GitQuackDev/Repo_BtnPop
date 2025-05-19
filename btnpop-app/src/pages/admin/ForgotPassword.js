import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');
      
      const response = await authApi.forgotPassword(email);
      
      setIsSuccess(true);
      setMessage(response.message || 'If your email exists in our system, you will receive a password reset link shortly.');
    } catch (err) {
      setIsSuccess(false);
      setError(err.response?.data?.message || 'An error occurred. Please try again later.');
      console.error('Forgot password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Reset Your Password</h2>
        
        {isSuccess ? (
          <div className="success-message">
            <p>{message}</p>
            <Link to="/admin/login" className="back-to-login">Back to Login</Link>
          </div>
        ) : (
          <>
            <p className="forgot-password-description">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="reset-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <div className="login-link">
              <Link to="/admin/login">Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
