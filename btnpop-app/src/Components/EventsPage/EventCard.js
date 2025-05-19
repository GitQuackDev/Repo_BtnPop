import React from 'react';
import './EventCard.css';
import { motion } from 'framer-motion';

function EventCard({ event, isUpcoming = false }) {
  // If there's no event data, return null
  if (!event) return null;

  // Format date
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // For upcoming featured event
  if (isUpcoming) {
    return (
      <motion.div 
        className="upcoming-event__wrapper"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="upcoming-event__image">
          <img 
            src={event.image || 'https://via.placeholder.com/800x500?text=No+Image'} 
            alt={event.title} 
          />
          <div className="upcoming-event__overlay"></div>
        </div>
        <div className="upcoming-event__content">
          <h2 className="upcoming-event__title">{event.title}</h2>
          <time className="upcoming-event__date">{formattedDate}</time>
          {event.location && (
            <div className="upcoming-event__location">
              <i className="fa-solid fa-location-dot"></i> {event.location}
            </div>
          )}
          <p className="upcoming-event__description">
            {event.description || 'No description available for this event.'}
          </p>
          <button 
            className="upcoming-event__button"
            onClick={() => event.onOpenModal(event)}
          >
            Learn More
          </button>
        </div>
      </motion.div>
    );
  }

  // Default event card
  return (
    <motion.article 
      className="event-card"
      whileHover={{ 
        y: -5,
        transition: { type: "spring", stiffness: 300 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="event-card__image-wrapper">
        <img 
          src={event.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={event.title} 
          className="event-card__image" 
          loading="lazy"
        />
        <div className="event-card__overlay">
          <button 
            className="event-card__button"
            onClick={() => event.onOpenModal(event)}
            aria-label="View details"
          >
            View Details
          </button>
        </div>
      </div>
      <div className="event-card__content">
        <h4 className="event-card__title">{event.title}</h4>
        <time className="event-card__date">{formattedDate}</time>
        {event.location && (
          <div className="event-card__location">
            <i className="fa-solid fa-location-dot"></i> {event.location}
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default EventCard;
