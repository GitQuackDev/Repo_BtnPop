import React, { useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaFacebook, FaTwitter, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import './EventModal.css';
import { motion, AnimatePresence } from 'framer-motion';

function EventModal({ event, isOpen, onClose }) {
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

  // If there's no event data or modal is closed, return null
  if (!event || !isOpen) return null;

  // Format date
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
        const eventDate = new Date(event.date);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="event-modal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="event-modal"
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
              <img 
                src={event.image || 'https://via.placeholder.com/1200x600?text=No+Image'} 
                alt={event.title} 
                className="event-modal__image" 
              />
              <div className="event-modal__overlay-gradient"></div>
            </div>
            
            <div className="event-modal__content">
              <header className="event-modal__header">
                <h1 className="event-modal__title">{event.title}</h1>
                
                <div className="event-modal__details">
                  <div className="event-modal__detail">
                    <FaCalendarAlt className="event-modal__icon" />
                    <span>{formattedDate}</span>
                  </div>
                  
                  {event.time && (
                    <div className="event-modal__detail">
                      <FaClock className="event-modal__icon" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="event-modal__detail">
                      <FaMapMarkerAlt className="event-modal__icon" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </header>
              
              <div className="event-modal__body">
                {event.description ? (
                  <div dangerouslySetInnerHTML={{ __html: event.description }} />
                ) : (
                  <p>No description available for this event.</p>
                )}
                
                {event.agenda && (
                  <div className="event-modal__agenda">
                    <h2 className="event-modal__subheading">Event Agenda</h2>
                    <div dangerouslySetInnerHTML={{ __html: event.agenda }} />
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
                  </button>
                </div>
                
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EventModal;
