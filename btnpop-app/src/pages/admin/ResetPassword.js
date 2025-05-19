import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import './ResetPassword.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setError('Invalid password reset link.');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { password, confirmPassword } = formData;
    
    // Form validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    try {      setIsSubmitting(true);
      setError('');
      setMessage('');
      
      await authApi.resetPassword(
        token, 
        password, 
        confirmPassword
      );
      
      setIsSuccess(true);
      setMessage('Your password has been reset successfully!');
      
      // Redirect to admin dashboard after 3 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 3000);
    } catch (err) {
      setIsSuccess(false);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again or request a new reset link.');
      console.error('Reset password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Set New Password</h2>
        
        {isSuccess ? (
          <div className="success-message">
            <p>{message}</p>
            <p>Redirecting to admin dashboard...</p>
          </div>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            
            <form onSubmit={handleSubmit} className="reset-password-form">
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  disabled={isSubmitting}
                  required
                />
                <small className="password-requirements">
                  Password must be at least 8 characters long.
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="reset-button"
                disabled={isSubmitting || !token}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
