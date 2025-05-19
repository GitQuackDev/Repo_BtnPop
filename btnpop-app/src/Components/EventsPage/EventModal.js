import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useCallback and useRef
import { IoMdClose } from 'react-icons/io';
import { FaFacebook, FaTwitter, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaUsers, FaRegCalendarCheck } from 'react-icons/fa';
import './EventModal.css';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import EventRegistrationForm from './EventRegistrationForm';
import { eventsApi } from '../../services/api';

// Fix for default marker icon issue with webpack
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

function EventModal({ event, isOpen, onClose }) {
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const advancedMarkerRef = useRef(null);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Define getMapCoordinates with useCallback, dependent on event object
  const getMapCoordinates = useCallback(() => {
    if (event && event.coordinates) {
      let coords = event.coordinates;
      if (typeof coords === 'string') {
        try {
          coords = JSON.parse(coords);
        } catch (e) {
          return null;
        }
      }
      if (
        coords &&
        typeof coords.lat === 'number' &&
        typeof coords.lng === 'number'
      ) {
        return coords;
      }
      // Sometimes coordinates might be { latitude, longitude }
      if (
        coords &&
        typeof coords.latitude === 'number' &&
        typeof coords.longitude === 'number'
      ) {
        return { lat: coords.latitude, lng: coords.longitude };
      }
    }
    return null; 
  }, [event]);

  const onLoadMap = useCallback((map) => {
    setMapInstance(map);
    const currentCoordinates = getMapCoordinates();
    if (currentCoordinates) {
        map.panTo(currentCoordinates);
    } else {
        // Optionally pan to a default location if no event coordinates
        // map.panTo({ lat: 14.5995, lng: 120.9842 }); 
    }
  }, [getMapCoordinates]); 

  const onUnmountMap = useCallback(() => {
    setMapInstance(null);
    if (advancedMarkerRef.current) {
      advancedMarkerRef.current.map = null;
      advancedMarkerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const currentCoordinates = getMapCoordinates();
    if (window.google && window.google.maps && window.google.maps.marker && mapInstance && currentCoordinates) {
      if (advancedMarkerRef.current) {
        advancedMarkerRef.current.map = null; // Clear previous marker
      }
      const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapInstance,
        position: currentCoordinates,
      });
      advancedMarkerRef.current = newMarker;
    }
  }, [mapInstance, getMapCoordinates]); // Depends on mapInstance and the memoized getMapCoordinates

  // If there's no event data, return null. Important: Keep isOpen check here for AnimatePresence to work.
  if (!event) return null;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formattedDate = formatDate(event.eventDate);
  const formattedEndDate = event.endDate ? formatDate(event.endDate) : null;
  
  // Get dates for display
  const getDisplayDate = () => {
    if (event.endDate) {
      return `${formattedDate} to ${formattedEndDate}`;
    }
    return formattedDate;
  };
  
  // Get times for display
  const getDisplayTime = () => {
    let timeDisplay = '';
    
    if (event.eventTime) {
      timeDisplay = event.eventTime;
      
      if (event.endTime) {
        timeDisplay += ` - ${event.endTime}`;
      }
    }
    
    return timeDisplay;
  };
  // Handle share
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = event.title;
    
    let shareUrl;
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'calendar':
        // Format date for calendar (YYYYMMDD)
        const eventDate = new Date(event.eventDate);
        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const day = String(eventDate.getDate()).padStart(2, '0');
        const formattedCalDate = `${year}${month}${day}`;
        
        // Add to Google Calendar
        shareUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formattedCalDate}/${formattedCalDate}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
        break;
      default:
        // Web Share API if available
        if (navigator.share) {
          navigator.share({
            title: event.title,
            text: event.description,
            url: window.location.href,
          })
          .catch((error) => console.log('Error sharing', error));
        }
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  // Toggle registration form
  const toggleRegistrationForm = () => {
    setIsRegistrationFormOpen(!isRegistrationFormOpen);
  };
    // Handle registration submission
  const handleRegistrationSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the API to register for the event
      const response = await eventsApi.registerForEvent(event._id, formData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="event-modal__backdrop" // Ensure this class is styled for overlay
          onClick={onClose} // Close modal when backdrop is clicked
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="event-modal__content-wrapper" // Changed from event-modal__content for styling separation
            onClick={(e) => e.stopPropagation()} // Prevent click on content from closing modal
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button 
              className="event-modal__close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <IoMdClose />
            </button>
            
            <div className="event-modal__hero">
              {/* Robust event image logic */}
              {(() => {
                let eventImage = event.imageUrl || event.image || 'https://via.placeholder.com/1200x600?text=No+Image';
                if (typeof eventImage === 'string' && eventImage.startsWith('/uploads/')) {
                  const apiUrl = process.env.REACT_APP_API_URL || window.location.origin;
                  eventImage = `${apiUrl}${eventImage}`;
                }
                return (
                  <img 
                    src={eventImage} 
                    alt={event.title} 
                    className="event-modal__image" 
                  />
                );
              })()}
              <div className="event-modal__overlay-gradient"></div>
            </div>
            
            <div className="event-modal__content"> {/* Actual scrollable content area */}
              <div className="event-modal__main-and-side">
                <aside className="event-modal__side-content">
                  {/* Location section: always show address if present, map if coordinates */}
                  {(event.location || getMapCoordinates()) && (
                    <div className="event-modal__location-map">
                      <h3 className="event-modal__section-title">Event Location</h3>
                      {event.location && (
                        <div className="event-modal__location-address">
                          <FaMapMarkerAlt className="event-modal__icon" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {getMapCoordinates() && (
                        <MapContainer
                          center={getMapCoordinates()}
                          zoom={15}
                          style={{ width: '100%', height: '200px', borderRadius: '8px', marginTop: '10px' }}
                          scrollWheelZoom={false}
                          dragging={false}
                          doubleClickZoom={false}
                          zoomControl={false}
                          attributionControl={false}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={getMapCoordinates()} />
                        </MapContainer>
                      )}
                    </div>
                  )}
                </aside>
                <div className="event-modal__main-content">
                  <header className="event-modal__header">
                    <h1 className="event-modal__title">{event.title}</h1>
                    
                    <div className="event-modal__details">
                      <div className="event-modal__detail">
                        <FaCalendarAlt className="event-modal__icon" />
                        <span>{getDisplayDate()}</span>
                      </div>
                      
                      {getDisplayTime() && (
                        <div className="event-modal__detail">
                          <FaClock className="event-modal__icon" />
                          <span>{getDisplayTime()}</span>
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="event-modal__detail">
                          <FaMapMarkerAlt className="event-modal__icon" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.organizer && (
                        <div className="event-modal__detail">
                          <FaUser className="event-modal__icon" />
                          <span>Organized by: {event.organizer}</span>
                        </div>
                      )}
                      
                      {event.participantCount > 0 && (
                        <div className="event-modal__detail">
                          <FaUsers className="event-modal__icon" />
                          <span>{event.participantCount} {event.participantCount === 1 ? 'Participant' : 'Participants'}</span>
                        </div>
                      )}
                    </div>
                  </header>
                  
                  <div className="event-modal__body">
                    {/* Event description */}
                    <div className="event-modal__description">
                      <h2 className="event-modal__subheading">About This Event</h2>
                      {event.description ? (
                        <div dangerouslySetInnerHTML={{ __html: event.description }} />
                      ) : (
                        <p>No description available for this event.</p>
                      )}
                    </div>
                    {/* Registration section */}
                    {event.registrationEnabled && (
                      <div className="event-modal__registration">
                        <h2 className="event-modal__subheading">Registration</h2>
                        
                        {event.maxParticipants && event.participantCount >= event.maxParticipants ? (
                          <div className="event-modal__registration-full">
                            <p>This event has reached maximum capacity.</p>
                          </div>
                        ) : (
                          <div className="event-modal__registration-available">
                            {event.maxParticipants && (
                              <p>
                                <FaUsers className="event-modal__icon" />
                                <span>{event.participantCount} / {event.maxParticipants} participants registered</span>
                              </p>
                            )}
                            
                            <button 
                              className="event-modal__register-button"
                              onClick={toggleRegistrationForm}
                            >
                              <FaRegCalendarCheck className="event-modal__button-icon" />
                              Register for this Event
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {event.speakers && event.speakers.length > 0 && (
                      <div className="event-modal__speakers">
                        <h2 className="event-modal__subheading">Featured Speakers</h2>
                        <div className="event-modal__speakers-grid">
                          {event.speakers.map((speaker, index) => (
                            <div key={index} className="event-modal__speaker">
                              {speaker.image && (
                                <img 
                                  src={speaker.image} 
                                  alt={speaker.name} 
                                  className="event-modal__speaker-image" 
                                />
                              )}
                              <div className="event-modal__speaker-info">
                                <h3 className="event-modal__speaker-name">{speaker.name}</h3>
                                {speaker.title && (
                                  <p className="event-modal__speaker-title">{speaker.title}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="event-modal__actions">
                <div className="event-modal__share-buttons">
                  <button 
                    onClick={() => handleShare('facebook')}
                    aria-label="Share on Facebook"
                    className="event-modal__share-button"
                  >
                    <FaFacebook />
                    <span>Share</span>
                  </button>
                  <button 
                    onClick={() => handleShare('twitter')}
                    aria-label="Share on Twitter"
                    className="event-modal__share-button"
                  >
                    <FaTwitter />
                    <span>Tweet</span>
                  </button>
                  <button 
                    onClick={() => handleShare('calendar')}
                    aria-label="Add to Calendar"
                    className="event-modal__share-button"
                  >
                    <FaCalendarAlt />
                    <span>Add to Calendar</span>
                  </button>                </div>
                
                {event.registerUrl && (
                  <a 
                    href={event.registerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="event-modal__register-button"
                  >
                    Register Now
                  </a>
                )}
              </div>
            </div>
            
            {/* Registration form modal */}
            <AnimatePresence>
              {isRegistrationFormOpen && (
                <motion.div 
                  className="event-modal__registration-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="event-modal__registration-modal"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                  >
                    <EventRegistrationForm 
                      event={event}
                      onSubmit={handleRegistrationSubmit}
                      onClose={toggleRegistrationForm}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EventModal;
