import React, { useEffect, useRef, useState, useCallback } from 'react';
import './eventspage.css';
import EventCard from '../Components/EventsPage/EventCard';
import EventModal from '../Components/EventsPage/EventModal';
import { eventsApi } from '../services/api';
import { motion } from 'framer-motion';
import { FaSearch, FaCalendarDay, FaCalendarAlt, FaCalendarCheck, FaHistory, FaChevronRight, FaFire } from 'react-icons/fa';

function EventsPage() {
  const heroRef = useRef(null);
  
  const [currentEventsList, setCurrentEventsList] = useState([]);
  const [upcomingEventsList, setUpcomingEventsList] = useState([]);
  const [pastEventsList, setPastEventsList] = useState([]);
  
  const [allFetchedEvents, setAllFetchedEvents] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); 
  const [currentSectionTitle, setCurrentSectionTitle] = useState('All Events');

  useEffect(() => {
    const hero = heroRef.current;
    const handleMouseMove = (e) => {
      if (!hero) return;
      const { clientX, clientY } = e;
      const { width, height, left, top } = hero.getBoundingClientRect();
      const xPos = (clientX - left) / width;
      const yPos = (clientY - top) / height;
      hero.style.setProperty('--mouse-x', xPos);
      hero.style.setProperty('--mouse-y', yPos);
    };
    if (hero) hero.addEventListener('mousemove', handleMouseMove);
    return () => {
      if (hero) hero.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const fetchAndCategorizeEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await eventsApi.getAllEvents();
        const fetchedEvents = response.events || [];
        setAllFetchedEvents(fetchedEvents);

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const current = [];
        const upcoming = [];
        const past = [];

        fetchedEvents.forEach(event => {
          const eventStartDate = new Date(event.eventDate);
          const eventStartDay = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
          
          let eventEndDate;
          if (event.endDate) {
            eventEndDate = new Date(event.endDate);
          } else {
            eventEndDate = new Date(event.eventDate);
          }
          const eventEndDay = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate(), 23, 59, 59, 999);

          if (eventEndDay < todayStart) {
            past.push(event);
          } else if (eventStartDay > todayStart) {
            upcoming.push(event);
          } else {
            current.push(event);
          }
        });
        
        upcoming.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        past.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
        current.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

        setCurrentEventsList(current);
        setUpcomingEventsList(upcoming);
        setPastEventsList(past);
        
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndCategorizeEvents();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      handleFilterChange(activeFilter, searchQuery);
    }
  }, [isLoading, currentEventsList, upcomingEventsList, pastEventsList, allFetchedEvents]);


  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  const closeEventModal = () => setIsModalOpen(false);

  const prepareEventWithHandler = useCallback((eventItem) => ({
    ...eventItem,
    onOpenModal: () => openEventModal(eventItem)
  }), []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSearchResults(true);
    handleFilterChange(activeFilter, searchQuery);
  };
  
  const handleFilterChange = useCallback((filterType, currentSearchQuery = searchQuery) => {
    setActiveFilter(filterType);
    let results = [];
    let title = '';

    let sourceEvents = (currentSearchQuery.trim() !== '') ? [...allFetchedEvents] : [];

    if (currentSearchQuery.trim() !== '') {
        sourceEvents = allFetchedEvents.filter(event => 
            event.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            (event.description && event.description.toLowerCase().includes(currentSearchQuery.toLowerCase())) ||
            (event.location && event.location.toLowerCase().includes(currentSearchQuery.toLowerCase()))
        );
    }

    switch (filterType) {
      case 'current':
        results = (currentSearchQuery.trim() !== '') ? sourceEvents.filter(event => currentEventsList.some(ce => ce._id === event._id)) : [...currentEventsList];
        title = 'Current Events';
        break;
      case 'upcoming':
        results = (currentSearchQuery.trim() !== '') ? sourceEvents.filter(event => upcomingEventsList.some(ue => ue._id === event._id)) : [...upcomingEventsList];
        title = 'Upcoming Events';
        break;
      case 'past':
        results = (currentSearchQuery.trim() !== '') ? sourceEvents.filter(event => pastEventsList.some(pe => pe._id === event._id)) : [...pastEventsList];
        title = 'Past Events';
        break;
      case 'all':
      default:
        if (currentSearchQuery.trim() !== '') {
            results = sourceEvents;
        } else {
            results = [...currentEventsList, ...upcomingEventsList, ...pastEventsList];
        }
        title = currentSearchQuery.trim() ? `Search Results for "${currentSearchQuery}"` : 'All Events';
        break;
    }
    
    setDisplayedEvents(results);
    setCurrentSectionTitle(title);
    setShowSearchResults(true);

  }, [searchQuery, allFetchedEvents, currentEventsList, upcomingEventsList, pastEventsList]);


  const clearSearchAndFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setShowSearchResults(false);
    setDisplayedEvents([...currentEventsList, ...upcomingEventsList, ...pastEventsList]);
    setCurrentSectionTitle('All Events');
  };


  if (isLoading && displayedEvents.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const getFeaturedEvent = () => {
    if (currentEventsList.length > 0) {
      return currentEventsList[0];
    } 
    if (upcomingEventsList.length > 0) {
      return upcomingEventsList[0];
    }
    return null;
  };

  const featuredEvent = getFeaturedEvent();

  return (
    <div className="events-page">
      <section className="events-hero" ref={heroRef}>
        <div className="events-hero__content">
          <motion.h1 
            className="events-hero__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover Our Events
          </motion.h1>
          <motion.p 
            className="events-hero__description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Explore a variety of exciting performances, workshops, and gatherings.
          </motion.p>
          
          <motion.div
            className="events-search-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <form className="events-search-form" onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                placeholder="Search by title, keyword, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="events-search-input"
              />
              <button type="submit" className="events-search-button"><FaSearch /> Search</button>
            </form>
            
            <div className="events-filter-buttons">
              {[
                { key: 'all', label: 'All Events', icon: <FaCalendarAlt /> },
                { key: 'current', label: 'Current', icon: <FaFire /> },
                { key: 'upcoming', label: 'Upcoming', icon: <FaCalendarCheck /> },
                { key: 'past', label: 'Past', icon: <FaHistory /> },
              ].map(filter => (
                <button 
                  key={filter.key}
                  className={`events-filter-button ${activeFilter === filter.key ? 'active' : ''}`}
                  onClick={() => handleFilterChange(filter.key, searchQuery)}
                >
                  {filter.icon} {filter.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <main className="events-page__content">
        {!isLoading && !error && (
          <>
            {showSearchResults ? (
              <section className="events-results-section">
                <div className="events-container">
                  <div className="events-section-header">
                    <h2 className="events-section-title">{currentSectionTitle}</h2>
                    <button onClick={clearSearchAndFilters} className="events-clear-button">
                      Clear Search/Filters
                    </button>
                  </div>
                  {displayedEvents.length > 0 ? (
                    <div className="events-grid">
                      {displayedEvents.map(event => (
                        <EventCard key={event._id} event={prepareEventWithHandler(event)} />
                      ))}
                    </div>
                  ) : (
                    <p className="events-empty-message">
                      No events match your criteria. Try adjusting your search or filters.
                    </p>
                  )}
                </div>
              </section>
            ) : (
              <>
                {featuredEvent && (
                  <section className="events-featured-section">
                    <div className="events-container">
                      <h2 className="events-featured-title">
                        <FaFire className="events-section-icon" /> 
                        <span>{currentEventsList.length > 0 ? "Happening Now" : "Coming Soon"}</span>
                      </h2>
                      <EventCard 
                        key={featuredEvent._id} 
                        event={prepareEventWithHandler(featuredEvent)} 
                        isUpcoming={true} 
                      />
                    </div>
                  </section>
                )}

                {currentEventsList.length > 0 && (
                  <section className="events-current-section">
                    <div className="events-container">
                      <div className="events-section-header">
                        <h2 className="events-section-title">
                          <FaFire className="events-section-icon" /> Current Events
                        </h2>
                        {currentEventsList.length > 4 && (
                          <button className="events-view-all" onClick={() => handleFilterChange('current', '')}>
                            View All <FaChevronRight />
                          </button>
                        )}
                      </div>
                      <div className="events-grid">
                        {currentEventsList.slice(featuredEvent && currentEventsList.includes(featuredEvent) ? 1 : 0, 4).map(event => (
                          <EventCard key={event._id} event={prepareEventWithHandler(event)} />
                        ))}
                      </div>
                    </div>
                  </section>
                )}
                
                {upcomingEventsList.length > 0 && (
                  <section className="events-upcoming-section">
                    <div className="events-container">
                      <div className="events-section-header">
                        <h2 className="events-section-title">
                          <FaCalendarCheck className="events-section-icon" /> Upcoming Events
                        </h2>
                        {upcomingEventsList.length > 4 && (
                          <button className="events-view-all" onClick={() => handleFilterChange('upcoming', '')}>
                            View All <FaChevronRight />
                          </button>
                        )}
                      </div>
                      <div className="events-grid">
                        {upcomingEventsList.slice(0, 4).map(event => (
                          <EventCard key={event._id} event={prepareEventWithHandler(event)} />
                        ))}
                      </div>
                    </div>
                  </section>
                )}
                
                {pastEventsList.length > 0 && (
                  <section className="events-past-section">
                    <div className="events-container">
                      <div className="events-section-header">
                        <h2 className="events-section-title">
                          <FaHistory className="events-section-icon" /> Past Events
                        </h2>
                        {pastEventsList.length > 4 && (
                          <button className="events-view-all" onClick={() => handleFilterChange('past', '')}>
                            View All <FaChevronRight />
                          </button>
                        )}
                      </div>
                      <div className="events-grid">
                        {pastEventsList.slice(0, 4).map(event => (
                          <EventCard key={event._id} event={prepareEventWithHandler(event)} />
                        ))}
                      </div>
                    </div>
                  </section>
                )}
                
                {!currentEventsList.length && !upcomingEventsList.length && !pastEventsList.length && (
                  <div className="events-empty-message events-empty-message--all-empty">
                    <p>No events are currently scheduled. Please check back soon!</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {isModalOpen && selectedEvent && (
        <EventModal event={selectedEvent} isOpen={isModalOpen} onClose={closeEventModal} />
      )}
    </div>
  );
}

export default EventsPage;