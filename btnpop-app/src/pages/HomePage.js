import React, { useState, useEffect } from 'react';
import heroImage from '../Content/Images/rari.jpg';
import './home.css';
import { newsApi } from '../services/api';
import NewsCard from '../Components/NewsPage/NewsCard';

function HomePage() {
  const [latestNewsItem, setLatestNewsItem] = useState(null); // Changed to single item
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setLoading(true);
        const response = await newsApi.getAllNews(1, 1); // Fetch only 1 latest news item
        if (response && response.news && response.news.length > 0) {
          setLatestNewsItem(response.news[0]); // Store the single news item
        } else {
          setLatestNewsItem(null);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching latest news:", err);
        setError("Failed to load latest news.");
        setLatestNewsItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNews();
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
        </div>
      </section>

      <section className="home_news">
        <div className="home_news__container">
          <div className="home_news__header_container"> 
            <span className="home_news__label">STAY UP TO DATE</span>
            <h2 className="home_news__title">OUR LATEST NEWS</h2>
          </div>

          {loading && <p className="home_news__loading">Loading news...</p>}
          {error && <p className="home_news__error">{error}</p>}
          
          {!loading && !error && !latestNewsItem && (
            <p className="home_news__empty">No latest news to display at the moment.</p>
          )}

          {!loading && !error && latestNewsItem && (
            <div className="home_news__latest_item_display"> {/* Renamed class for single item display */}
              <NewsCard news={latestNewsItem} isFeature={true} /> {/* Display single item as a feature card */}
            </div>
          )}
        </div>
      </section>

      <section className="events">
        <h2 className="events__title">UPCOMING EVENTS AND IMPORTANT DATES</h2>
        <h3 className="events__label">STAY TUNED!</h3>
        <div className="events__scroll-container">
          <div className="events__grid">
            <div className="events__card">
              <div className="events__card-content">
                <h4>Event 1</h4>
                <p>Coming Soon</p>
              </div>
            </div>
            <div className="events__card">
              <div className="events__card-content">
                <h4>Event 2</h4>
                <p>Coming Soon</p>
              </div>
            </div>
            <div className="events__card">
              <div className="events__card-content">
                <h4>Event 3</h4>
                <p>Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="history">
        <h2 className="history__title">We're going to make history.</h2>
      </section>
    </>
  );
}

export default HomePage;