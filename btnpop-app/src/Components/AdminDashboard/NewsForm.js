import React, { useState, useRef } from 'react';
import { FaTimesCircle, FaImage } from 'react-icons/fa';
import './NewsForm.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function NewsForm({ news = null, onSubmit, onCancel }) {
  // Initialize form with existing news data or default values
  const [formData, setFormData] = useState({
    title: news?.title || '',
    author: news?.author || '',
    summary: news?.summary || '',
    content: news?.content || '',
    date: news?.date ? new Date(news.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    image: null,
    featured: news?.featured || false,
    category: news?.category || 'General' // Added category
  });
  
  // Preview for current image
  const [imagePreview, setImagePreview] = useState(news?.imageUrl || null); // Changed news?.image to news?.imageUrl
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const newsCategories = [
    'General', 'Technology', 'Business', 'Entertainment', 'Sports', 'Science', 
    'Health', 'World', 'Lifestyle', 'Travel', 'Education', 'Environment', 
    'Local News', 'Politics', 'Culture', 'Opinion', 'Feature' // Added 'Feature'
  ];
  
  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle rich text editor changes
  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content
    });
    
    // Clear content error
    if (errors.content) {
      setErrors({
        ...errors,
        content: null
      });
    }
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
    
    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required';
    } else if (formData.summary.length > 200) {
      newErrors.summary = 'Summary must be 200 characters or less';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.category) { // Added category validation
      newErrors.category = 'Category is required';
    }
    
    // Only require image if creating a new news item
    if (!news && !formData.image) {
      newErrors.image = 'Image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('NewsForm handleSubmit triggered'); // New log

    if (validateForm()) {
      console.log('NewsForm validation passed. FormData:', formData); // New log
      onSubmit(formData);
    } else {
      console.log('NewsForm validation failed. Errors:', errors); // New log
    }
  };
  
  // Quill editor modules
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'], // Restored 'image'
      ['clean']
    ]
  };

  // Quill editor formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image' // Restored 'image'
  ];

  return (
    <div className="news-form">
      <h2 className="news-form__title">{news ? 'Edit News' : 'Create News'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="news-form__group">
          <label htmlFor="title" className="news-form__label">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`news-form__input ${errors.title ? 'error' : ''}`}
            placeholder="Enter news title"
          />
          {errors.title && <span className="news-form__error">{errors.title}</span>}
        </div>
        
        <div className="news-form__group">
          <label htmlFor="author" className="news-form__label">Author</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            className="news-form__input"
            placeholder="Enter author name"
          />
        </div>
        
        <div className="news-form__group">
          <label htmlFor="date" className="news-form__label">Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className={`news-form__input ${errors.date ? 'error' : ''}`}
          />
          {errors.date && <span className="news-form__error">{errors.date}</span>}
        </div>
        
        <div className="news-form__group">
          <label htmlFor="category" className="news-form__label">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`news-form__input ${errors.category ? 'error' : ''}`}
          >
            {newsCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <span className="news-form__error">{errors.category}</span>}
        </div>

        <div className="news-form__group">
          <label htmlFor="summary" className="news-form__label">Summary * <span className="news-form__hint">(Max 200 characters)</span></label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            className={`news-form__textarea ${errors.summary ? 'error' : ''}`}
            rows="3"
            placeholder="Enter a brief summary of the news"
            maxLength="200"
          ></textarea>
          <div className="news-form__char-count">
            {formData.summary.length}/200 characters
          </div>
          {errors.summary && <span className="news-form__error">{errors.summary}</span>}
        </div>
        
        <div className="news-form__group">
          <label className="news-form__label">Content *</label>
          <ReactQuill
            value={formData.content}
            onChange={handleContentChange}
            modules={modules}
            formats={formats}
            className={`news-form__editor ${errors.content ? 'error' : ''}`}
            placeholder="Write your news content here..."
          />
          {errors.content && <span className="news-form__error">{errors.content}</span>}
        </div>
        
        <div className="news-form__group">
          <label className="news-form__label">Image {!news && '*'}</label>
          <div 
            className={`news-form__image-upload ${errors.image ? 'error' : ''}`}
            onClick={handleImageClick}
          >
            {imagePreview ? (
              <div className="news-form__image-preview-container">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="news-form__image-preview" 
                />
                <button 
                  type="button"
                  className="news-form__image-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  <FaTimesCircle />
                </button>
              </div>
            ) : (
              <div className="news-form__image-placeholder">
                <FaImage />
                <span>Click to upload image</span>
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
          {errors.image && <span className="news-form__error">{errors.image}</span>}
        </div>
        
        <div className="news-form__group">
          <label className="news-form__checkbox-container">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="news-form__checkbox"
            />
            <span className="news-form__checkbox-label">Featured News (will appear in the spotlight section)</span>
          </label>
        </div>
        
        <div className="news-form__actions">
          <button 
            type="button" 
            className="news-form__btn news-form__btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="news-form__btn news-form__btn--submit"
          >
            {news ? 'Update News' : 'Create News'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewsForm;
