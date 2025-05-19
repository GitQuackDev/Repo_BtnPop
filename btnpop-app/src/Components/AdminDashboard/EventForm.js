import React, { useState, useRef } from 'react';
import { FaTimesCircle, FaImage } from 'react-icons/fa';
import './EventForm.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function EventForm({ event = null, onSubmit, onCancel }) {
  // Initialize form with existing event data or default values
  const [formData, setFormData] = useState({
    title: event?.title || '',
    location: event?.location || '',
    time: event?.time || '',
    description: event?.description || '',
    date: event?.date ? new Date(event.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    image: null,
    agenda: event?.agenda || '',
    registerUrl: event?.registerUrl || ''
  });
  
  // Preview for current image
  const [imagePreview, setImagePreview] = useState(event?.image || null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  
  // Handle text input changes
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
  
  // Handle rich text editor changes for description
  const handleDescriptionChange = (description) => {
    setFormData({
      ...formData,
      description
    });
    
    // Clear description error
    if (errors.description) {
      setErrors({
        ...errors,
        description: null
      });
    }
  };
  
  // Handle rich text editor changes for agenda
  const handleAgendaChange = (agenda) => {
    setFormData({
      ...formData,
      agenda
    });
  };
  
  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Preview the selected image
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData({
        ...formData,
        image: file
      });
      
      // Clear image error
      if (errors.image) {
        setErrors({
          ...errors,
          image: null
        });
      }
    }
  };
  
  // Trigger file input click
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
  // Remove selected image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({
      ...formData,
      image: null
    });
    fileInputRef.current.value = '';
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Only require image if creating a new event
    if (!event && !formData.image) {
      newErrors.image = 'Image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  // Quill editor modules
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  };
  
  // Quill editor formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

  return (
    <div className="event-form">
      <h2 className="event-form__title">{event ? 'Edit Event' : 'Create Event'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="event-form__group">
          <label htmlFor="title" className="event-form__label">Event Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`event-form__input ${errors.title ? 'error' : ''}`}
            placeholder="Enter event title"
          />
          {errors.title && <span className="event-form__error">{errors.title}</span>}
        </div>
        
        <div className="event-form__row">
          <div className="event-form__group">
            <label htmlFor="date" className="event-form__label">Event Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`event-form__input ${errors.date ? 'error' : ''}`}
            />
            {errors.date && <span className="event-form__error">{errors.date}</span>}
          </div>
          
          <div className="event-form__group">
            <label htmlFor="time" className="event-form__label">Event Time</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="event-form__input"
            />
          </div>
        </div>
        
        <div className="event-form__group">
          <label htmlFor="location" className="event-form__label">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className={`event-form__input ${errors.location ? 'error' : ''}`}
            placeholder="Enter event location"
          />
          {errors.location && <span className="event-form__error">{errors.location}</span>}
        </div>
        
        <div className="event-form__group">
          <label className="event-form__label">Description *</label>
          <ReactQuill
            value={formData.description}
            onChange={handleDescriptionChange}
            modules={modules}
            formats={formats}
            className={`event-form__editor ${errors.description ? 'error' : ''}`}
            placeholder="Write your event description here..."
          />
          {errors.description && <span className="event-form__error">{errors.description}</span>}
        </div>
        
        <div className="event-form__group">
          <label className="event-form__label">Agenda (Optional)</label>
          <ReactQuill
            value={formData.agenda}
            onChange={handleAgendaChange}
            modules={modules}
            formats={formats}
            className="event-form__editor"
            placeholder="Add event agenda details here..."
          />
        </div>
        
        <div className="event-form__group">
          <label htmlFor="registerUrl" className="event-form__label">Registration URL (Optional)</label>
          <input
            type="url"
            id="registerUrl"
            name="registerUrl"
            value={formData.registerUrl}
            onChange={handleInputChange}
            className="event-form__input"
            placeholder="https://example.com/register"
          />
        </div>
        
        <div className="event-form__group">
          <label className="event-form__label">Event Image {!event && '*'}</label>
          <div 
            className={`event-form__image-upload ${errors.image ? 'error' : ''}`}
            onClick={handleImageClick}
          >
            {imagePreview ? (
              <div className="event-form__image-preview-container">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="event-form__image-preview" 
                />
                <button 
                  type="button"
                  className="event-form__image-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  <FaTimesCircle />
                </button>
              </div>
            ) : (
              <div className="event-form__image-placeholder">
                <FaImage />
                <span>Click to upload event image</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          {errors.image && <span className="event-form__error">{errors.image}</span>}
        </div>
        
        <div className="event-form__actions">
          <button 
            type="button" 
            className="event-form__btn event-form__btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="event-form__btn event-form__btn--submit"
          >
            {event ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventForm;
