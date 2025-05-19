import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaTimesCircle, FaImage, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaClock } from 'react-icons/fa';
import './EventForm.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
  marginBottom: '20px'
};

const defaultCenter = {
  lat: 14.5995, // Default to Philippines
  lng: 120.9842
};

// Component to handle map click events and pan the map
function LocationClickEffect({ onMapClick }) {
  const map = useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng); // Pass latlng to parent
      }
      map.flyTo(e.latlng, map.getZoom()); // Pan map to new location
    },
  });
  return null; // This component does not render anything itself
}

function EventForm({ event = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    location: event?.location || '', // Location name (text input)
    eventTime: event?.eventTime || '',
    description: event?.description || '',
    eventDate: event?.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
    endTime: event?.endTime || '',
    image: null,
    organizer: event?.organizer || '',
    category: event?.category || 'Other',
    registrationEnabled: event?.registrationEnabled !== false,
    maxParticipants: event?.maxParticipants || '',
    isFeatured: event?.isFeatured || false,
    // coordinates are handled by markerPosition state
  });
  
  const [markerPosition, setMarkerPosition] = useState(
    event?.coordinates || defaultCenter
  );
  
  const [imagePreview, setImagePreview] = useState(null); // Changed initial state
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const mapRef = useRef(null); // For MapContainer instance

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };
  
  const handleDescriptionChange = (description) => {
    setFormData(prev => ({ ...prev, description }));
    if (errors.description) setErrors(prev => ({ ...prev, description: null }));
  };

  // Callback for LocationClickEffect to update marker position and form data
  const handleMapMarkerMove = useCallback(async (latlng) => {
    setMarkerPosition(latlng);
    // Use Nominatim reverse geocoding to get address
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`);
      const data = await response.json();
      const address = data.display_name || `Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`;
      setFormData(prevData => ({
        ...prevData,
        coordinates: latlng,
        location: address
      }));
    } catch (err) {
      setFormData(prevData => ({
        ...prevData,
        coordinates: latlng,
        location: `Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`
      }));
    }
    if (errors.coordinates) {
        setErrors(prevErrors => ({...prevErrors, coordinates: null}));
    }
  }, [errors.coordinates]);
  
  const handleLocationChange = (e) => { // For the location name text input
    const { value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      location: value
    }));
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: null }));
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, image: file }));
      if (errors.image) setErrors(prev => ({ ...prev, image: null }));
    }
  };

  const handleImageClick = () => fileInputRef.current.click();

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: null }));
    if(fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.eventDate) newErrors.eventDate = 'Date is required';
    if (!formData.location.trim()) newErrors.location = 'Location name is required'; // For text input
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!event && !formData.image) newErrors.image = 'Image is required';
    if (!markerPosition || markerPosition.lat === undefined || markerPosition.lng === undefined) {
        newErrors.coordinates = 'Please select a location on the map.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        coordinates: JSON.stringify(markerPosition)
      };
      // If editing and no new image is selected, remove image from dataToSubmit so backend keeps old image
      if (!formData.image && event && event.imageUrl) {
        delete dataToSubmit.image;
      }
      onSubmit(dataToSubmit);
    }
  };
  
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

  // Effect to pan map to markerPosition if it changes due to loading an existing event
  useEffect(() => {
    if (mapRef.current && markerPosition) {
      mapRef.current.flyTo([markerPosition.lat, markerPosition.lng], mapRef.current.getZoom());
    }
  }, [markerPosition]); // Only re-run if markerPosition changes (e.g. on initial load of an event)

  // Effect to manage image preview based on existing event image or newly selected file
  useEffect(() => {
    if (!formData.image) { // If no local file is selected/staged for upload...
      if (event && event.imageUrl) { // ...and there's an existing image URL for the event...
        let imageUrlToDisplay = event.imageUrl;
        // Prepend API URL if it's a relative path from backend
        if (typeof imageUrlToDisplay === 'string' && imageUrlToDisplay.startsWith('/uploads/')) {
          const apiUrl = process.env.REACT_APP_API_URL || window.location.origin;
          imageUrlToDisplay = `${apiUrl}${imageUrlToDisplay}`;
        }
        setImagePreview(imageUrlToDisplay); // ...then display that existing image.
      } else {
        setImagePreview(null); // ...otherwise, no image to preview.
      }
    }
    // If formData.image IS present, imagePreview is handled by handleImageChange (which sets a data URL).
    // When formData.image is set to null (e.g., by handleRemoveImage), this effect will run
    // and correctly restore the preview of event.imageUrl if it exists.
  }, [event, event?.imageUrl, formData.image]);


  return (
    <div className="event-form">
      <h2 className="event-form__title">{event ? 'Edit Event' : 'Create Event'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="event-form__group">
          <label htmlFor="title" className="event-form__label">Event Title *</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} className={`event-form__input ${errors.title ? 'error' : ''}`} placeholder="Enter event title"/>
          {errors.title && <span className="event-form__error">{errors.title}</span>}
        </div>
        <div className="event-form__row">
          <div className="event-form__group">
            <label htmlFor="eventDate" className="event-form__label">Event Date *</label>
            <input type="date" id="eventDate" name="eventDate" value={formData.eventDate} onChange={handleInputChange} className={`event-form__input ${errors.eventDate ? 'error' : ''}`}/>
            {errors.eventDate && <span className="event-form__error">{errors.eventDate}</span>}
          </div>
          <div className="event-form__group">
            <label htmlFor="eventTime" className="event-form__label">Event Time</label>
            <input type="time" id="eventTime" name="eventTime" value={formData.eventTime} onChange={handleInputChange} className="event-form__input"/>
          </div>
        </div>
        
        <div className="event-form__group">
          <label htmlFor="location" className="event-form__label">Location Name *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleLocationChange}
            className={`event-form__input ${errors.location ? 'error' : ''}`}
            placeholder="Enter a name for the event location (e.g., Main Hall)"
          />
          {errors.location && <span className="event-form__error">{errors.location}</span>}
        </div>

        <div className="event-form__group">
          <label className="event-form__label">Pin Location on Map *</label>
          <MapContainer 
            center={event?.coordinates || defaultCenter} // Initial center
            zoom={13} 
            style={mapContainerStyle}
            whenCreated={instance => { mapRef.current = instance; }} // Get map instance
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationClickEffect onMapClick={handleMapMarkerMove} />
            {markerPosition && markerPosition.lat !== undefined && markerPosition.lng !== undefined && (
              <Marker position={[markerPosition.lat, markerPosition.lng]} />
            )}
          </MapContainer>
          {errors.coordinates && <span className="event-form__error">{errors.coordinates}</span>}
        </div>

        <div className="event-form__group">
          <label htmlFor="description" className="event-form__label">Description *</label>
          <ReactQuill
            value={formData.description}
            onChange={handleDescriptionChange}
            modules={modules}
            formats={formats}
            className={errors.description ? 'error' : ''}
            placeholder="Detailed description of the event"
          />
          {errors.description && <span className="event-form__error">{errors.description}</span>}
        </div>

        <div className="event-form__group">
          <label htmlFor="organizer" className="event-form__label">Organizer</label>
          <input
            type="text"
            id="organizer"
            name="organizer"
            value={formData.organizer}
            onChange={handleInputChange}
            className="event-form__input"
            placeholder="Name of the organizer or department"
          />
        </div>

        <div className="event-form__group">
          <label htmlFor="category" className="event-form__label">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="event-form__input"
          >
            <option value="Music">Music</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Conference">Conference</option>
            <option value="Sports">Sports</option>
            <option value="Community">Community</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="event-form__group">
          <label htmlFor="image" className="event-form__label">
            Event Banner Image {event ? '(Optional: to change existing)' : '*'}
          </label>
          <input
            type="file"
            id="image"
            name="image"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
            accept="image/*"
          />
          <div className="event-form__image-upload-area">
            {imagePreview ? (
              <div className="event-form__image-preview-container">
                <img src={imagePreview} alt="Event Preview" className="event-form__image-preview" />
                <button type="button" onClick={handleRemoveImage} className="event-form__button event-form__button--remove-image">
                  <FaTimesCircle /> Remove Image
                </button>
              </div>
            ) : (
              <div className="event-form__image-placeholder" onClick={handleImageClick}>
                <FaImage className="event-form__image-placeholder-icon" />
                <p>Click to upload an image</p>
                <span>Recommended size: 1200x600px</span>
              </div>
            )}
          </div>
          {errors.image && <span className="event-form__error">{errors.image}</span>}
        </div>
        
        <details className="event-form__advanced-options">
          <summary>Advanced Options</summary>
          <div className="event-form__row">
            <div className="event-form__group">
              <label htmlFor="endDate" className="event-form__label">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="event-form__input"
              />
            </div>
            <div className="event-form__group">
              <label htmlFor="endTime" className="event-form__label">End Time</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="event-form__input"
              />
            </div>
          </div>
          <div className="event-form__group">
            <label htmlFor="maxParticipants" className="event-form__label">Max Participants (Optional)</label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              className="event-form__input"
              placeholder="e.g., 100 (leave blank for unlimited)"
              min="1"
            />
          </div>
          <div className="event-form__checkbox-group">
            <input
              type="checkbox"
              id="registrationEnabled"
              name="registrationEnabled"
              checked={formData.registrationEnabled}
              onChange={(e) => setFormData({ ...formData, registrationEnabled: e.target.checked })}
              className="event-form__checkbox"
            />
            <label htmlFor="registrationEnabled" className="event-form__checkbox-label">Enable Registration</label>
          </div>
          <div className="event-form__checkbox-group">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="event-form__checkbox"
            />
            <label htmlFor="isFeatured" className="event-form__checkbox-label">Feature this Event</label>
          </div>
        </details>
        
        <div className="event-form__actions">
          <button type="submit" className="event-form__button event-form__button--submit">
            {event ? 'Update Event' : 'Create Event'}
          </button>
          <button type="button" className="event-form__button event-form__button--cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventForm;

// If you see context/render errors, delete node_modules and package-lock.json, then run npm install again.
