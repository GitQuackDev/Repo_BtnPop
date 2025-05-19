import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import './AdminLogin.css';
import { motion } from 'framer-motion';

function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      await authApi.login(credentials);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login__container">
      <motion.div 
        className="admin-login__form-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="admin-login__header">
          <h1 className="admin-login__title">Admin Panel</h1>
          <p className="admin-login__subtitle">Sign in to manage your content</p>
        </div>
        
        <form className="admin-login__form" onSubmit={handleSubmit}>
          {error && (
            <div className="admin-login__error">
              {error}
            </div>
          )}
          
          <div className="admin-login__input-group">
            <label htmlFor="email" className="admin-login__label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="admin-login__input"
              value={credentials.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
            <div className="admin-login__input-group">
            <label htmlFor="password" className="admin-login__label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="admin-login__input"
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            <div className="admin-login__forgot-password">
              <a href="/admin/forgot-password">Forgot password?</a>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="admin-login__button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="admin-login__footer">
          <p>BTN POP Admin Panel</p>
          <p className="admin-login__copyright">&copy; {new Date().getFullYear()} BTN Association</p>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminLogin;
