import React, { useEffect, useRef, useState } from 'react';
import './eventspage.css';
import EventCard from '../Components/EventsPage/EventCard';
import EventModal from '../Components/EventsPage/EventModal';
import { eventsApi } from '../services/api';
import { motion } from 'framer-motion';

function EventsPage() {
  const heroRef = useRef(null);
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [moreEvents, setMoreEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'upcoming', 'past'

  // Handle mouse move effect
  useEffect(() => {
    const hero = heroRef.current;
    
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = hero.getBoundingClientRect();
      
      const xPos = (clientX - left) / width;
      const yPos = (clientY - top) / height;
      
      hero.style.setProperty('--mouse-x', xPos);
      hero.style.setProperty('--mouse-y', yPos);
    };

    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (hero) {
        hero.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);  // Fetch events data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get upcoming events
        const upcomingData = await eventsApi.getUpcomingEvents(4); // Get 4 upcoming events
        
        // Set the first one as the featured upcoming event
        if (upcomingData && upcomingData.length > 0) {
          setUpcomingEvent(upcomingData[0]);
          // Set the rest as "more events"
          setMoreEvents(upcomingData.slice(1));
        }
        
        // Get all events (for future pagination)
        const allEvents = await eventsApi.getAllEvents();
        
        // Filter past events (you might want to adjust this logic)
        const now = new Date();
        const past = (allEvents.events || []).filter(event => 
          new Date(event.eventDate) < now && !event.isUpcoming
        );
        setPastEvents(past);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Open event modal
  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  // Close event modal
  const closeEventModal = () => {
    setIsModalOpen(false);
  };
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (searchQuery.trim() === '') {
      setShowSearchResults(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const results = await eventsApi.searchEvents(searchQuery);
      setSearchResults(results.events || []);
      setShowSearchResults(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Error searching events:", err);
      setError("Failed to search events. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Filter events
  const filterEvents = async (filter) => {
    setActiveFilter(filter);
    setIsLoading(true);
    
    try {
      let filteredEvents;
      
      switch (filter) {
        case 'upcoming':
          const upcomingData = await eventsApi.getUpcomingEvents(10);
          filteredEvents = upcomingData || [];
          break;
        case 'past':
          const pastData = await eventsApi.getPastEvents();
          filteredEvents = pastData.events || [];
          break;
        default: // 'all'
          const allData = await eventsApi.getAllEvents();
          filteredEvents = allData.events || [];
      }
      
      setSearchResults(filteredEvents);
      setShowSearchResults(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Error filtering events:", err);
      setError("Failed to filter events. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading && !upcomingEvent && !moreEvents.length) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  // Show error state
  if (error && !upcomingEvent && !moreEvents.length) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  // Add onClick handler to event items
  const prepareEventWithHandler = (eventItem) => ({
    ...eventItem,
    onOpenModal: openEventModal
  });

  return (
    <>      <section className="events_hero" ref={heroRef}>
        <div className="events_hero__content">
          <motion.span 
            className="events_hero__label"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            UPCOMING EVENTS
          </motion.span>
          <motion.h1 
            className="events_hero__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            CATCH OUR EVENTS
          </motion.h1>
          <motion.p 
            className="events_hero__description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Join us for exciting performances, workshops, and gatherings. Our events bring together artists and audiences for unforgettable experiences.
          </motion.p>
          
          <motion.div
            className="events_search-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {/* Search form */}
            <form className="events_search-form" onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search for events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="events_search-input"
              />
              <button type="submit" className="events_search-button">Search</button>
            </form>
            
            {/* Filter buttons */}
            <div className="events_filter-buttons">
              <button 
                className={`events_filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => filterEvents('all')}
              >
                All Events
              </button>
              <button 
                className={`events_filter-button ${activeFilter === 'upcoming' ? 'active' : ''}`}
                onClick={() => filterEvents('upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`events_filter-button ${activeFilter === 'past' ? 'active' : ''}`}
                onClick={() => filterEvents('past')}
              >
                Past Events
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {upcomingEvent && (
        <section className="upcoming-event">
          <div className="upcoming-event__container">
            <motion.span 
              className="upcoming-event__label"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              UP NEXT
            </motion.span>
            <EventCard 
              event={prepareEventWithHandler(upcomingEvent)} 
              isUpcoming={true} 
            />
          </div>
        </section>
      )}
    
      {moreEvents.length > 0 && (
        <section className="more-events">
          <div className="more-events__container">
            <span className="more-events__label">More to come...</span>
            <div className="more-events__grid">
              {moreEvents.map((event) => (
                <EventCard 
                  key={event._id} 
                  event={prepareEventWithHandler(event)} 
                />
              ))}
            </div>
          </div>
        </section>
      )}
        {pastEvents.length > 0 && !showSearchResults && (
        <section className="past-events">
          <div className="more-events__container">
            <span className="more-events__label">Past Events</span>
            <div className="more-events__grid">
              {pastEvents.slice(0, 3).map((event) => (
                <EventCard 
                  key={event._id} 
                  event={prepareEventWithHandler(event)} 
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Search Results Section */}
      {showSearchResults && (
        <section className="search-results">
          <div className="search-results__container">
            <div className="search-results__header">
              <h2 className="search-results__title">
                {activeFilter !== 'all' 
                  ? activeFilter === 'upcoming' 
                    ? 'Upcoming Events' 
                    : 'Past Events'
                  : searchQuery 
                    ? `Search Results for "${searchQuery}"` 
                    : 'All Events'
                }
              </h2>
              {showSearchResults && (
                <button 
                  className="search-results__clear" 
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
            
            {searchResults.length > 0 ? (
              <div className="search-results__grid">
                {searchResults.map((event) => (
                  <EventCard 
                    key={event._id} 
                    event={prepareEventWithHandler(event)} 
                  />
                ))}
              </div>
            ) : (
              <div className="search-results__empty">
                <p>No events found. Please try a different search term.</p>
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Event Modal */}
      <EventModal 
        event={selectedEvent} 
        isOpen={isModalOpen}
        onClose={closeEventModal}
      />
    </>
  );
}

export default EventsPage;