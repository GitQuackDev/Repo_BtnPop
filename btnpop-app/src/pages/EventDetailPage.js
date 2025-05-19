import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsApi } from '../services/api';
import EventModal from '../Components/EventsPage/EventModal';
import './eventdetailpage.css';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaRegCalendarCheck, 
         FaShareAlt, FaTicketAlt, FaInfoCircle } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


const getEventImageSrc = (event) => {
  if (!event) return 'https://via.placeholder.com/1200x400?text=No+Image';
  
  const img = event.image || event.imageUrl;
  if (img) {
    if (typeof img === 'string' && img.startsWith('/uploads/')) {
      const apiUrl = process.env.REACT_APP_API_URL || window.location.origin;
      return `${apiUrl}${img}`;
    } else {
      return img;
    }
  }
  return 'https://via.placeholder.com/1200x400?text=No+Image';
};



function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const eventData = await eventsApi.getEventById(id);
        setEvent(eventData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  
  const getDisplayDate = () => {
    if (!event) return '';
    
    if (event.endDate) {
      return `${formatDate(event.eventDate)} to ${formatDate(event.endDate)}`;
    }
    return formatDate(event.eventDate);
  };
  
  
  const getDisplayTime = () => {
    if (!event) return '';
    
    let timeDisplay = '';
    
    if (event.eventTime) {
      timeDisplay = event.eventTime;
      
      if (event.endTime) {
        timeDisplay += ` - ${event.endTime}`;
      }
    }
    
    return timeDisplay;
  };

  
  const handleOpenRegistration = () => {
    setIsModalOpen(true);
  };

  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  
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
  
  

  

  if (isLoading) {
    return (
      <div className="event-detail__loading">
        <div className="spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail__error">
        <h2>Error</h2>
        <p>{error || "Event not found"}</p>
        <Link to="/events" className="event-detail__back-link">
          <FaArrowLeft /> Back to Events
        </Link>
      </div>
    );
  }
  return (
    <div className="event-detail-page">
      <div className="event-detail__header">
        <div className="event-detail__header-content">
          <Link to="/events" className="event-detail__back-button">
            <FaArrowLeft /> Back to Events
          </Link>
          <div className="event-detail__share-button">
            <FaShareAlt /> Share
          </div>
        </div>
      </div>

      <motion.div 
        className="event-detail__hero" 
        style={{ backgroundImage: `url(${getEventImageSrc(event)})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="event-detail__hero-overlay"></div>
        <div className="event-detail__hero-content">
          <motion.div 
            className="event-detail__title-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h1 className="event-detail__title">{event.title}</h1>
            
            <div className="event-detail__top-meta">
              <div className="event-detail__meta-pill">
                <FaCalendarAlt className="event-detail__meta-icon" />
                <span>{getDisplayDate()}</span>
              </div>
              
              {getDisplayTime() && (
                <div className="event-detail__meta-pill">
                  <FaClock className="event-detail__meta-icon" />
                  <span>{getDisplayTime()}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      <div className="event-detail__floating-register">
        <div className="event-detail__floating-register-info">
          <div className="event-detail__floating-date">
            <div className="event-detail__date-month">
              {new Date(event.eventDate).toLocaleDateString('en-US', {month: 'short'})}
            </div>
            <div className="event-detail__date-day">
              {new Date(event.eventDate).getDate()}
            </div>
          </div>
          <div className="event-detail__floating-title">
            {event.title}
          </div>
        </div>
        
        {event.registrationEnabled && event.maxParticipants && event.participantCount < event.maxParticipants && (
          <button className="event-detail__floating-button" onClick={handleOpenRegistration}>
            <FaTicketAlt /> Register
          </button>
        )}
      </div>

      <div className="event-detail__container">
        <div className="event-detail__content">
          <main className="event-detail__main-content">
            <section className="event-detail__overview">
              <div className="event-detail__meta-cards">
                {event.organizer && (
                  <div className="event-detail__meta-card">
                    <FaUser className="event-detail__card-icon" />
                    <div>
                      <h4>Organizer</h4>
                      <p>{event.organizer}</p>
                    </div>
                  </div>
                )}
                
                {event.location && (
                  <div className="event-detail__meta-card">
                    <FaMapMarkerAlt className="event-detail__card-icon" />
                    <div>
                      <h4>Location</h4>
                      <p>{event.location}</p>
                    </div>
                  </div>
                )}
                
                {event.registrationEnabled && event.maxParticipants && (
                  <div className="event-detail__meta-card">
                    <FaRegCalendarCheck className="event-detail__card-icon" />
                    <div>
                      <h4>Registration</h4>
                      <div className="event-detail__capacity-bar-container">
                        <div 
                          className="event-detail__capacity-bar" 
                          style={{ width: `${Math.min(100, (event.participantCount / event.maxParticipants) * 100)}%` }}
                        ></div>
                      </div>
                      <p>{event.participantCount} / {event.maxParticipants} registered</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="event-detail__description-section">
              <h2 className="event-detail__section-title">About This Event</h2>
              <div className="event-detail__content-card">
                {event.description ? (
                  <div dangerouslySetInnerHTML={{ __html: event.description }} className="event-detail__rich-text" />
                ) : (
                  <p className="event-detail__no-content">No description available for this event.</p>
                )}
              </div>
            </section>
            
            {event.speakers && event.speakers.length > 0 && (
              <section className="event-detail__speakers-section">
                <h2 className="event-detail__section-title">Featured Speakers</h2>
                <div className="event-detail__speakers-grid">
                  {event.speakers.map((speaker, index) => (
                    <motion.div 
                      key={index} 
                      className="event-detail__speaker-card"
                      whileHover={{ y: -10, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      {speaker.image ? (
                        <img 
                          src={speaker.image} 
                          alt={speaker.name} 
                          className="event-detail__speaker-image" 
                        />
                      ) : (
                        <div className="event-detail__speaker-placeholder">
                          {speaker.name.charAt(0)}
                        </div>
                      )}
                      <div className="event-detail__speaker-info">
                        <h3 className="event-detail__speaker-name">{speaker.name}</h3>
                        {speaker.title && (
                          <p className="event-detail__speaker-title">{speaker.title}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {event.agenda && (
              <section className="event-detail__agenda-section">
                <h2 className="event-detail__section-title">Event Agenda</h2>
                <div className="event-detail__content-card">
                  <div dangerouslySetInnerHTML={{ __html: event.agenda }} className="event-detail__rich-text" />
                </div>
              </section>
            )}
          </main>

          <aside className="event-detail__sidebar">
            {event.registrationEnabled && (
              <div className="event-detail__registration-card">
                <h3 className="event-detail__card-title">Registration</h3>
                {event.maxParticipants && event.participantCount >= event.maxParticipants ? (
                  <div className="event-detail__sold-out">
                    <FaInfoCircle />
                    <p>This event has reached maximum capacity.</p>
                  </div>
                ) : (
                  <div className="event-detail__registration-info">
                    {event.maxParticipants && (
                      <div className="event-detail__capacity">
                        <div className="event-detail__capacity-bar-container">
                          <div 
                            className="event-detail__capacity-bar" 
                            style={{ width: `${Math.min(100, (event.participantCount / event.maxParticipants) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="event-detail__capacity-text">
                          <strong>{event.maxParticipants - event.participantCount}</strong> spots remaining
                        </p>
                      </div>
                    )}
                    
                    <button 
                      className="event-detail__register-button"
                      onClick={handleOpenRegistration}
                    >
                      <FaTicketAlt className="event-detail__button-icon" />
                      Register Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {getMapCoordinates() && (
              <div className="event-detail__map-card">
                <h3 className="event-detail__card-title">Event Location</h3>
                {event.location && (
                  <div className="event-detail__location-address">
                    <FaMapMarkerAlt className="event-detail__meta-icon" />
                    <span>{event.location}</span>
                  </div>
                )}
                <MapContainer
                  center={getMapCoordinates()}
                  zoom={15}
                  className="event-detail__map"
                  scrollWheelZoom={false}
                  dragging={true}
                  doubleClickZoom={false}
                  zoomControl={true}
                  attributionControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https:/{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={getMapCoordinates()} />
                </MapContainer>
                <a 
                  href={`https://maps.google.com/?q=${getMapCoordinates()?.lat},${getMapCoordinates()?.lng}`}
                  className="event-detail__directions-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions
                </a>
              </div>
            )}
            
            <div className="event-detail__share-card">
              <h3 className="event-detail__card-title">Share This Event</h3>
              <div className="event-detail__share-buttons">
                <button className="event-detail__share-btn facebook">Facebook</button>
                <button className="event-detail__share-btn twitter">Twitter</button>
                <button className="event-detail__share-btn linkedin">LinkedIn</button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Event Modal for Registration */}
      {isModalOpen && event && (
        <EventModal 
          event={event} 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}

export default EventDetailPage;
