import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers } from 'react-icons/fa';

function EventCard({ event, isUpcoming = false }) {
  // If there's no event data, return null
  if (!event) return null;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Use imageUrl (from backend) or fallback to placeholder
  let eventImage = event.imageUrl || event.image || 'https://via.placeholder.com/800x500?text=No+Image';
  // If imageUrl is a relative path, prepend backend path for local dev or production
  if (eventImage && eventImage.startsWith('/uploads/')) {
    const apiUrl = process.env.REACT_APP_API_URL || window.location.origin;
    eventImage = `${apiUrl}${eventImage}`;
  }
  
  // Get event status - calculate this once before any rendering paths
  const getEventStatus = () => {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    const eventEndDate = event.endDate ? new Date(event.endDate) : eventDate;
    
    if (now >= eventDate && now <= eventEndDate) {
      return { label: "Happening Now", className: "event-status--current" };
    } else if (now < eventDate) {
      return { label: "Upcoming", className: "event-status--upcoming" };
    } else {
      return { label: "Past", className: "event-status--past" };
    }
  };

  const eventStatus = getEventStatus();

  // For upcoming featured event
  if (isUpcoming) {
    return (
      <motion.div 
        className="featured-event"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="featured-event__content">
          <span className={`featured-event__status ${eventStatus.className}`}>
            {eventStatus.label}
          </span>
          <h2 className="featured-event__title">{event.title}</h2>

          <div className="featured-event__details">
            <div className="featured-event__detail">
              <FaCalendarAlt className="featured-event__icon" />
              <span>{formatDate(event.eventDate)}</span>
            </div>

            {event.eventTime && (
              <div className="featured-event__detail">
                <FaClock className="featured-event__icon" />
                <span>{event.eventTime}{event.endTime ? ` - ${event.endTime}` : ''}</span>
              </div>
            )}

            {event.location && (
              <div className="featured-event__detail">
                <FaMapMarkerAlt className="featured-event__icon" />
                <span>{event.location}</span>
              </div>
            )}

            {event.maxParticipants && (
              <div className="featured-event__detail">
                <FaUsers className="featured-event__icon" />
                <span>
                  {event.participantCount || 0} / {event.maxParticipants} participants
                </span>
              </div>
            )}
          </div>

          <div className="featured-event__description">
            {event.description ? (
              <p>{typeof event.description === 'string' && event.description.length > 150 ? 
                `${event.description.replace(/<[^>]*>?/gm, '').slice(0, 150)}...` : 
                event.description.replace(/<[^>]*>?/gm, '')}
              </p>
            ) : (
              <p>No description available for this event.</p>
            )}
          </div>

          <div className="featured-event__actions">
            <button 
              className="featured-event__action featured-event__action--quickview"
              onClick={() => event.onOpenModal()}
            >
              Quick View
            </button>
            <Link 
              to={`/events/${event._id}`} 
              className="featured-event__action featured-event__action--details"
            >
              Event Details
            </Link>
          </div>
        </div>

        <div className="featured-event__image-container">
          <img 
            src={eventImage} 
            alt={event.title} 
            className="featured-event__image"
          />
          <div className="featured-event__image-overlay"></div>
        </div>
      </motion.div>
    );
  }

  // Default event card
  return (
    <motion.article 
      className="event-card"
      whileHover={{ 
        y: -8,
        transition: { type: "spring", stiffness: 300 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="event-card__image-wrapper">
        <img 
          src={eventImage} 
          alt={event.title} 
          className="event-card__image" 
          loading="lazy"
        />
        <span className={`event-card__status ${eventStatus.className}`}>{eventStatus.label}</span>
      </div>

      <div className="event-card__content">
        <h3 className="event-card__title">{event.title}</h3>
        
        <div className="event-card__details">
          <div className="event-card__detail">
            <FaCalendarAlt className="event-card__icon" />
            <span>{formatDate(event.eventDate)}</span>
          </div>
          
          {event.location && (
            <div className="event-card__detail">
              <FaMapMarkerAlt className="event-card__icon" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
        
        <div className="event-card__actions">
          <button 
            className="event-card__button"
            onClick={() => event.onOpenModal()}
          >
            Quick View
          </button>
          <Link 
            to={`/events/${event._id}`} 
            className="event-card__button event-card__button--details"
          >
            Details
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default EventCard;
