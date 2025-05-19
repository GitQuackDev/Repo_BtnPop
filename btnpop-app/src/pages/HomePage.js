import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../Content/Images/rari.jpg';
import './home.css';
import { newsApi, eventsApi } from '../services/api';
import NewsCard from '../Components/NewsPage/NewsCard';
import EventCard from '../Components/EventsPage/EventCard';
import EventModal from '../Components/EventsPage/EventModal'; // Import the EventModal component
import { motion } from 'framer-motion';
import { FaCalendarAlt } from 'react-icons/fa';

function HomePage() {
  const [latestNewsItem, setLatestNewsItem] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [eventsError, setEventsError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch the latest news
  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setNewsLoading(true);
        const response = await newsApi.getAllNews(1, 1); // Fetch only 1 latest news item
        if (response && response.news && response.news.length > 0) {
          setLatestNewsItem(response.news[0]); // Store the single news item
        } else {
          setLatestNewsItem(null);
        }
        setNewsError(null);
      } catch (err) {
        console.error("Error fetching latest news:", err);
        setNewsError("Failed to load latest news.");
        setLatestNewsItem(null);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchLatestNews();
  }, []);
  // Fetch current and upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const response = await eventsApi.getCurrentAndUpcomingEvents(3); // Fetch 3 events (current + upcoming)
        if (response && response.events) {
          setUpcomingEvents(response.events);
        } else {
          setUpcomingEvents([]);
        }
        setEventsError(null);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEventsError("Failed to load events.");
        setUpcomingEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero__background">
          <img src={heroImage} alt="" aria-hidden="true" />
        </div>
        <div className="hero__content">
          <h1 className='hero__title'>Main Headline</h1>
          <p className='hero__description'>
            BTN POP is a music and video event which brings together talents in the province of Bataan in a multi-media affair. <br /> <br />
            SONGS submitted by local songwriters interpreted by upcoming home-grown artists, featured in a MUSIC VIDEO directed by local filmmakers, will all lead up to an exciting LIVE EVENT!
          </p>
        </div>
        <div className="hero__image">
          <img src={heroImage} alt="Hero" />
        </div>      </section>
      
      <div className="section-divider">
        <div className="wave"></div>
      </div>
      
      <section className="home_news">
        <div className="home_news__container">
          <div className="home_news__header_container"> 
            <span className="home_news__label">STAY UP TO DATE</span>
            <h2 className="home_news__title">OUR LATEST NEWS</h2>
          </div>

          {newsLoading && <p className="home_news__loading">Loading news...</p>}
          {newsError && <p className="home_news__error">{newsError}</p>}
          
          {!newsLoading && !newsError && !latestNewsItem && (
            <p className="home_news__empty">No latest news to display at the moment.</p>
          )}

          {!newsLoading && !newsError && latestNewsItem && (
            <div className="home_news__latest_item_display">
              <NewsCard news={latestNewsItem} isFeature={true} />
            </div>
          )}
        </div>
      </section>

      <div className="section-divider">
        <div className="wave"></div>
      </div>      <section className="home_events">
        <div className="home_events__container">
          <div className="home_events__header"> 
            <h2 className="home_events__title">CURRENT & UPCOMING EVENTS</h2>
            <span className="home_events__label">JOIN US!</span>
          </div>
          
          {eventsLoading && (
            <div className="home_events__loading">
              <div className="spinner"></div>
              <p>Loading upcoming events...</p>
            </div>
          )}
          
          {eventsError && <p className="home_events__error">{eventsError}</p>}
            {!eventsLoading && !eventsError && upcomingEvents.length === 0 && (
            <div className="home_events__empty">
              <div className="home_events__empty-card">
                <FaCalendarAlt className="home_events__empty-icon" />
                <p className="home_events__empty-text">No current or upcoming events to display at the moment.</p>
                <p className="home_events__coming-soon">Check back soon for exciting events!</p>
              </div>
            </div>
          )}
          
          {!eventsLoading && !eventsError && upcomingEvents.length > 0 && (
            <>
              <div className="home_events__grid">                {upcomingEvents.map((event, index) => (
                  <motion.div 
                    key={event._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="home_events__card-wrapper"
                  >
                    <div className="home_events__card-container">
                      {event.eventStatus && (
                        <div className={`home_events__status-badge home_events__status-badge--${event.eventStatus}`}>
                          {event.eventStatus === 'current' ? 'HAPPENING NOW' : 'UPCOMING'}
                        </div>
                      )}
                      <EventCard event={{...event, onOpenModal: () => { setSelectedEvent(event); setIsModalOpen(true); }}} />
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="home_events__view-all">
                <Link to="/events" className="home_events__view-all-btn">
                  <span>View All Events</span>
                  <FaCalendarAlt />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="section-divider">
        <div className="wave"></div>
      </div>

      <section className="history">
        <h2 className="history__title">We're going to make history.</h2>
      </section>

      {isModalOpen && selectedEvent && (
        <EventModal event={selectedEvent} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedEvent(null); }} />
      )}
    </>
  );
}

export default HomePage;