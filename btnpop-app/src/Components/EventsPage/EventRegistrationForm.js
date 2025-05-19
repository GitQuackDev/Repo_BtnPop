import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaTimesCircle, FaCheckCircle, FaIdCard } from 'react-icons/fa';
import { participantsApi } from '../../services/api';
import './EventRegistrationForm.css';

function EventRegistrationForm({ event, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    additionalInfo: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-() ]{7,20}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        const response = await onSubmit(formData);
        setSubmitSuccess(true);
        setRegistrationData(response.participant);
      } catch (error) {
        console.error('Registration error:', error);
        setSubmitError(error.response?.data?.message || 'Failed to register. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const handleDownloadTicket = () => {
    if (registrationData && registrationData._id) {
      // Get ticket download URL
      const ticketUrl = participantsApi.downloadTicket(registrationData._id);
      
      // Open the ticket URL in a new tab.
      // The browser will handle the download based on Content-Disposition header from server.
      window.open(ticketUrl, '_blank');
    }
  };
  
  // Show success message after submission
  if (submitSuccess) {
    return (
      <div className="event-registration-form__success">
        <div className="event-registration-form__success-icon">
          <FaCheckCircle />
        </div>
        <h3>Registration Successful!</h3>
        <p>Your registration for <strong>{event.title}</strong> has been confirmed.</p>
        
        <div className="event-registration-form__registration-id">
          <div className="event-registration-form__id-label">
            <FaIdCard /> Your Registration ID:
          </div>
          <div className="event-registration-form__id-value">
            {registrationData.joinId}
          </div>
        </div>
        
        <p className="event-registration-form__save-note">
          Please save this ID as proof of your registration.
        </p>
        
        <div className="event-registration-form__actions">
          <button 
            className="event-registration-form__button event-registration-form__button--primary"
            onClick={handleDownloadTicket}
          >
            Download Ticket
          </button>
          
          <button 
            className="event-registration-form__button event-registration-form__button--secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="event-registration-form">
      <div className="event-registration-form__header">
        <h2>Register for Event</h2>
        <button 
          className="event-registration-form__close"
          onClick={onClose}
          aria-label="Close registration form"
        >
          <FaTimesCircle />
        </button>
      </div>
      
      {submitError && (
        <div className="event-registration-form__error-message">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="event-registration-form__group">
          <label htmlFor="name" className="event-registration-form__label">
            <FaUser /> Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`event-registration-form__input ${errors.name ? 'error' : ''}`}
            placeholder="Enter your full name"
            disabled={isSubmitting}
          />
          {errors.name && <span className="event-registration-form__field-error">{errors.name}</span>}
        </div>
        
        <div className="event-registration-form__group">
          <label htmlFor="email" className="event-registration-form__label">
            <FaEnvelope /> Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`event-registration-form__input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
          {errors.email && <span className="event-registration-form__field-error">{errors.email}</span>}
        </div>
        
        <div className="event-registration-form__group">
          <label htmlFor="phone" className="event-registration-form__label">
            <FaPhone /> Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`event-registration-form__input ${errors.phone ? 'error' : ''}`}
            placeholder="Enter your phone number"
            disabled={isSubmitting}
          />
          {errors.phone && <span className="event-registration-form__field-error">{errors.phone}</span>}
        </div>
        
        <div className="event-registration-form__group">
          <label htmlFor="additionalInfo" className="event-registration-form__label">
            Additional Information
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleInputChange}
            className="event-registration-form__textarea"
            placeholder="Any additional information you'd like to share"
            rows="3"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="event-registration-form__actions">
          <button 
            type="button" 
            className="event-registration-form__button event-registration-form__button--secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="event-registration-form__button event-registration-form__button--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Register Now'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventRegistrationForm;
