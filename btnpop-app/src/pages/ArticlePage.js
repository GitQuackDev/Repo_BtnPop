import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoIosArrowBack, IoMdClose } from 'react-icons/io';
import { FaFacebook, FaTwitter, FaLinkedin, FaThumbsUp, FaThumbsDown, FaSearch } from 'react-icons/fa';
import { newsApi } from '../services/api';
import NewsCard from '../Components/NewsPage/NewsCard';
import './articlepage.css';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);

  // State for like/dislike
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userAction, setUserAction] = useState(null); // 'liked', 'disliked', or null

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        
        const articleData = await newsApi.getNewsById(id);
        setArticle(articleData);
        setLikes(articleData.likes || 0);
        setDislikes(articleData.dislikes || 0);
        
        // Check localStorage for saved user action on this article
        const savedUserActions = JSON.parse(localStorage.getItem('newsUserActions') || '{}');
        const savedAction = savedUserActions[id];
        setUserAction(savedAction || null);
        
        const allNews = await newsApi.getAllNews(1, 4);
        const related = (allNews.news || []).filter(news => news._id !== id);
        setRelatedArticles(related);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Failed to load article. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchArticle();
  }, [id]);

  // Save user action to localStorage
  const saveUserAction = (action) => {
    try {
      const savedUserActions = JSON.parse(localStorage.getItem('newsUserActions') || '{}');
      savedUserActions[id] = action;
      localStorage.setItem('newsUserActions', JSON.stringify(savedUserActions));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const handleLike = async () => {
    if (!article) return;
    
    // If user already liked, do nothing (can't like multiple times)
    if (userAction === 'liked') return;
    
    try {
      // Send the previous action to the backend
      const response = await axios.post(`/api/news/${article._id}/like`, { previousAction: userAction });
      
      // Update state with response from server
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);
      
      // Update user action state and save to localStorage
      setUserAction('liked');
      saveUserAction('liked');
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleDislike = async () => {
    if (!article) return;
    
    // If user already disliked, do nothing (can't dislike multiple times)
    if (userAction === 'disliked') return;
    
    try {
      // Send the previous action to the backend
      const response = await axios.post(`/api/news/${article._id}/dislike`, { previousAction: userAction });
      
      // Update state with response from server
      setDislikes(response.data.dislikes);
      setLikes(response.data.likes);
      
      // Update user action state and save to localStorage
      setUserAction('disliked');
      saveUserAction('disliked');
    } catch (error) {
      console.error('Error disliking article:', error);
    }
  };

  // Handle social media sharing
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article?.title || '';
    
    let shareUrl;
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading article...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/news')}>Back to News</button>
      </div>
    );
  }

  // If article not found
  if (!article) {
    return (
      <div className="error-container">
        <h2>Article Not Found</h2>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/news')}>Back to News</button>
      </div>
    );
  }
  
  // Format date
  const formattedDate = article.publishDate ? new Date(article.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Date unavailable';

  return (
    <>
      <article className="article">
        <motion.button 
          className="article__back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <IoIosArrowBack />
          <span>Back to News</span>
        </motion.button>

        <motion.header 
          className="article__header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="article__meta">
            {article.category && article.category !== 'General' && (
              <span className="article__category">{article.category}</span>
            )}
            <time className="article__date">{formattedDate}</time>
            {article.author && <span className="article__author">By {article.author}</span>}
          </div>
          <h1 className="article__title">{article.title}</h1>
          
          <div className="article__actions">
            <button 
              onClick={handleLike} 
              className={`action-button like-button ${userAction === 'liked' ? 'active' : ''}`}
              aria-label="Like this article"
            >
              <FaThumbsUp /> <span>Like{likes > 0 ? ` (${likes})` : ''}</span>
            </button>
            <button 
              onClick={handleDislike} 
              className={`action-button dislike-button ${userAction === 'disliked' ? 'active' : ''}`}
              aria-label="Dislike this article"
            >
              <FaThumbsDown /> <span>Dislike{dislikes > 0 ? ` (${dislikes})` : ''}</span>
            </button>
          </div>
        </motion.header>

        <motion.div 
          className="article__hero-container"
          onClick={() => setShowFullImage(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          aria-label="Click to view full image"
        >
          <img 
            src={article.imageUrl || 'https://via.placeholder.com/1200x600?text=No+Image'} 
            alt={article.title}
            className="article__image"
          />
          <div className="article__hero-overlay">
            <div className="article__hero-zoom">
              <FaSearch />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="article__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {article.summary && (
            <p className="article__summary">
              <strong>{article.summary}</strong>
            </p>
          )}
          <div 
            className="article__body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </motion.div>

        <motion.div 
          className="article__share"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="article__share-title">Share this article</h3>
          <div className="article__share-buttons">
            <button 
              onClick={() => handleShare('facebook')}
              aria-label="Share on Facebook"
              className="article__share-button article__share-button--facebook"
            >
              <FaFacebook />
              <span>Facebook</span>
            </button>
            <button 
              onClick={() => handleShare('twitter')}
              aria-label="Share on Twitter"
              className="article__share-button article__share-button--twitter"
            >
              <FaTwitter />
              <span>Twitter</span>
            </button>
            <button 
              onClick={() => handleShare('linkedin')}
              aria-label="Share on LinkedIn"
              className="article__share-button article__share-button--linkedin"
            >
              <FaLinkedin />
              <span>LinkedIn</span>
            </button>
          </div>
        </motion.div>

        {relatedArticles.length > 0 && (
          <motion.section 
            className="related-articles"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <h2 className="related-articles__title">Related Articles</h2>
            <div className="related-articles__grid">
              {relatedArticles.slice(0, 3).map(relatedNews => (
                <NewsCard 
                  key={relatedNews._id} 
                  news={relatedNews} 
                />
              ))}
            </div>
          </motion.section>
        )}
      </article>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {showFullImage && (
          <motion.div 
            className="fullscreen-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFullImage(false)}
          >
            <motion.img 
              src={article.imageUrl || 'https://via.placeholder.com/1200x600?text=No+Image'} 
              alt={article.title}
              className="fullscreen-modal__image"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            />
            <button 
              className="fullscreen-modal__close" 
              onClick={() => setShowFullImage(false)}
              aria-label="Close full screen image"
            >
              <IoMdClose size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ArticlePage;