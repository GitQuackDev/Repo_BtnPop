import React, { useEffect, useRef, useState } from 'react';
import './newspage.css';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import NewsCard from '../Components/NewsPage/NewsCard';
import NewsModal from '../Components/NewsPage/NewsModal';
import { newsApi } from '../services/api';
import { motion } from 'framer-motion';

function NewsPage() {
  const heroRef = useRef(null);
  const [featuredNews, setFeaturedNews] = useState(null);
  const [trendingNews, setTrendingNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const newsPerPage = 3; // Changed from 6 to 3
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories] = useState([
    'all', 'General', 'Technology', 'Business', 'Entertainment', 'Sports', 'Science', 
    'Health', 'World', 'Lifestyle', 'Travel', 'Education', 'Environment', 
    'Local News', 'Politics', 'Culture', 'Opinion'
  ]);

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
  }, []);
  // Fetch news data
  useEffect(() => {
    let isActive = true; // Guard against setting state on unmounted component or stale requests

    const fetchData = async () => {
      try {
        if (isActive) {
          setIsLoading(true);
          setError(null); // Clear previous errors
        }
        
        // Get featured news
        const featuredNewsArray = await newsApi.getFeaturedNews();
        if (isActive) {
          setFeaturedNews(featuredNewsArray && featuredNewsArray.length > 0 ? featuredNewsArray[0] : null);
        }
        
        // Get trending news
        const trendingResponse = await newsApi.getTrendingNews();
        if (isActive) {
          setTrendingNews(trendingResponse.news || []); 
        }
        
        // Get latest news with pagination
        const latestDataFromServer = await newsApi.getAllNews(currentPage, newsPerPage);
        
        if (isActive) {
          if (latestDataFromServer && latestDataFromServer.news) {
            // API is expected to return paginated data, so use it directly
            setLatestNews(latestDataFromServer.news || []); 
            setTotalPages(latestDataFromServer.totalPages || 1);
          } else {
            // Handle case where data or news array is not available
            setLatestNews([]);
            setTotalPages(1);
          }
        }
      } catch (err) {
        if (isActive) {
          console.error("Error fetching news:", err);
          setError("Failed to load news. Please try again later.");
          // Optionally clear data on error
          // setLatestNews([]);
          // setTotalPages(1);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();

    return () => {
      isActive = false; // Cleanup function to set isActive to false when component unmounts or dependencies change
    };
  }, [currentPage, newsPerPage]); // newsPerPage is in dependency array

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({
        top: document.querySelector(".latest").offsetTop - 100,
        behavior: "smooth"
      });
    }
  };

  // Open news modal
  const openNewsModal = (news) => {
    setSelectedNews(news);
    setIsModalOpen(true);
  };
  // Close news modal
  const closeNewsModal = () => {
    setIsModalOpen(false);
  };
  
  // Handle search
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (searchQuery.trim() === '' && activeCategory === 'all') {
      setShowSearchResults(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const filters = {};
      if (searchQuery.trim() !== '') {
        filters.search = searchQuery;
      }
      if (activeCategory !== 'all') {
        filters.category = activeCategory;
      }
      
      const results = await newsApi.getAllNews(1, 12, filters);
      
      setSearchResults(results.news || []);
      setShowSearchResults(true);
      setCurrentPage(1);
      setTotalPages(results.totalPages || 1);
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error searching news:", err);
      setError("Failed to search news. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Filter by category
  const filterByCategory = (category) => {
    setActiveCategory(category);
    
    // If category is "all" and there's no search query, reset to normal view
    if (category === 'all' && searchQuery.trim() === '') {
      setShowSearchResults(false);
    } else {
      handleSearch();
    }
  };

  // Show loading state
  if (isLoading && !latestNews.length) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading news...</p>
      </div>
    );
  }

  // Show error state
  if (error && !latestNews.length) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  // Add onClick handler to news items
  const prepareNewsWithHandler = (newsItem) => ({
    ...newsItem,
    onOpenModal: openNewsModal
  });

  return (
    <>      <section className="news_hero" ref={heroRef}>
        <div className="news_hero__content">
          <motion.p 
            className='news_hero__description'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            BTN POP is a music and video event which brings together talents in the province of Bataan in a multi-media affair.
            SONGS submitted by local songwriters interpreted by upcoming home-grown artists, featured in a MUSIC VIDEO directed by local filmmakers, will all lead up to an exciting LIVE EVENT!
          </motion.p>
          
          <motion.div
            className="news_search-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {/* Search form */}
            <form className="news_search-form" onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search news..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="news_search-input"
              />
              <button type="submit" className="news_search-button">Search</button>
            </form>
            
            {/* Category Filters */}
            <div className="news_category-filters">
              <div className="news_category-filters-scroll">
                {categories.map(category => (
                  <button 
                    key={category} 
                    className={`news_category-button ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => filterByCategory(category)}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="news">
        <div className="news__grid">
          <section className="feature">
            <h2 className="feature__title">Weekly Highlight</h2>
            {featuredNews && <NewsCard news={prepareNewsWithHandler(featuredNews)} isFeature={true} />}
          </section>

          <section className="trending">
            <h2 className="trending__title">Trending News</h2>
            <div className="trending__container">
              <div className="trending__list">
                {trendingNews.map((item) => (
                  <NewsCard 
                    key={item._id} 
                    news={prepareNewsWithHandler(item)}
                    isTrending={true} 
                  />
                ))}
                {!trendingNews.length && !isLoading && (
                  <p className="no-results">No trending news at the moment.</p>
                )}
              </div>
            </div>
          </section>
        </div>
        
        <section className="latest">
          <div className="latest__header">
            <h2 className="latest__title">
              {showSearchResults ? 
                (activeCategory !== 'all' 
                  ? `${activeCategory} News` 
                  : searchQuery 
                    ? `Search Results for "${searchQuery}"` 
                    : 'All News')
                : 'Latest News'
              }
            </h2>
            {showSearchResults && (
              <button 
                className="latest__clear-search" 
                onClick={() => {
                  setShowSearchResults(false);
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                Clear Search
              </button>
            )}
          </div>
          
          <div className="latest__grid">
            {(showSearchResults ? searchResults : latestNews).map((item) => (
              <NewsCard 
                key={item._id} 
                news={prepareNewsWithHandler(item)} 
              />
            ))}
            {((showSearchResults && searchResults.length === 0) || 
              (!showSearchResults && latestNews.length === 0)) && !isLoading && (
              <p className="no-results">
                {showSearchResults 
                  ? "No matching news articles found. Please try a different search term." 
                  : "No news articles available."}
              </p>
            )}
          </div>
          
          {((showSearchResults && searchResults.length > 0) || 
            (!showSearchResults && latestNews.length > 0)) && (
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
          )}
        </section>
      </main>
      
      {/* News Modal */}
      <NewsModal 
        news={selectedNews} 
        isOpen={isModalOpen}
        onClose={closeNewsModal}
      />
    </>
  );
}

export default NewsPage;