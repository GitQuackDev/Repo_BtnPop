import React, { useEffect, useRef, useState } from 'react';
import './newspage.css';
import rari from '../Content/Images/haha.jpg';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

function NewsPage() {
  const heroRef = useRef(null);

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
  }, []);

    const trendingNews = [1, 2, 3, 4, 5, 6].map(item => ({
    id: item,
    title: "BTN Association, as represented by Sir Gabriel Jessie Guevarra, participated in the Balanga City's Creative Burst Workshop.",
    date: "January 1 2025",
    image: rari
  }));

  const latestNews = [1, 2, 3, 4, 5, 6].map(item => ({
    id: item,
    title: "BTN Association, as represented by Sir Gabriel Jessie Guevarra, participated in the Balanga City's Creative Burst Workshop.",
    date: "January 1 2025",
    image: rari
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 3;
  
  // Get current news items
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = latestNews.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(latestNews.length / newsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <>
      <section className="news_hero" ref={heroRef}>
        <div className="news_hero__content">
          <p className='news_hero__description'>
            BTN POP is a music and video event which brings together talents in the province of Bataan in a multi-media affair.
            SONGS submitted by local songwriters interpreted by upcoming home-grown artists, featured in a MUSIC VIDEO directed by local filmmakers, will all lead up to an exciting LIVE EVENT!
          </p>
        </div>
      </section>

      <main className="news">
        <div className="news__grid">
          <section className="feature">
            <h2 className="feature__title">Weekly Highlight</h2>
            <article className="feature__card">
              <img src={rari} alt="Weekly Highlight" className="feature__image" />
              <div className="feature__content">
                <h3 className="feature__heading">BTN Association, as represented by Sir Gabriel Jessie Guevarra, participated in the Balanga City's Creative Burst Workshop.</h3>
                <time className="feature__date">January 1 2025</time>
              </div>
            </article>
          </section>

          <section className="trending">
            <h2 className="trending__title">Trending News</h2>
            <div className="trending__container">
              <div className="trending__list">
                {trendingNews.map((item) => (
                  <article key={item.id} className="trending__card">
                    <div className="trending__image-wrapper">
                      <img src={item.image} alt={`Trending ${item.id}`} className="trending__image" />
                    </div>
                    <div className="trending__content">
                      <h4 className="trending__heading">{item.title}</h4>
                      <time className="trending__date">{item.date}</time>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="latest">
          <h2 className="latest__title">Latest News</h2>
          <div className="latest__grid">
            {currentNews.map((item) => (
              <article key={item.id} className="latest__card">
                <div className="latest__image-wrapper">
                  <img src={item.image} alt={`News ${item.id}`} className="latest__image" />
                </div>
                <div className="latest__content">
                  <h4 className="latest__heading">{item.title}</h4>
                  <time className="latest__date">{item.date}</time>
                </div>
              </article>
            ))}
          </div>
          
          <div className="pagination">
            <button 
              className={`pagination__arrow ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <IoIosArrowBack />
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`pagination__button ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
                aria-label={`Page ${index + 1}`}
              >
                <span className="pagination__dot"></span>
              </button>
            ))}

            <button 
              className={`pagination__arrow ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <IoIosArrowForward />
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

export default NewsPage;