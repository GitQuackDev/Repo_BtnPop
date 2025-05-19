import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NewsCard.css';
import { motion } from 'framer-motion';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import axios from 'axios';

function NewsCard({ news, isFeature = false, isTrending = false }) {
  // Moved useState hooks to the top, before any conditional returns.
  // Initialize with values from news if news exists, otherwise default to 0 or null.
  const [likes, setLikes] = useState(news ? news.likes || 0 : 0);
  const [dislikes, setDislikes] = useState(news ? news.dislikes || 0 : 0);
  const [userAction, setUserAction] = useState(null); // 'liked', 'disliked', or null

  // Load user action from localStorage on first render - moved before conditional return
  useEffect(() => {
    if (!news || !news._id) return;
    
    try {
      const savedUserActions = JSON.parse(localStorage.getItem('newsUserActions') || '{}');
      if (savedUserActions[news._id]) {
        setUserAction(savedUserActions[news._id]);
      }
    } catch (error) {
      console.error('Error loading saved user actions:', error);
    }
  }, [news]);

  // If there's no news data, return null
  if (!news) return null;

  const displayCategory = news.category && news.category !== 'General' ? news.category : null;

  // Save user action to localStorage
  const saveUserAction = (action) => {
    try {
      const savedUserActions = JSON.parse(localStorage.getItem('newsUserActions') || '{}');
      savedUserActions[news._id] = action;
      localStorage.setItem('newsUserActions', JSON.stringify(savedUserActions));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    
    // If user already liked, do nothing (can't like multiple times)
    if (userAction === 'liked') return;
    
    try {
      const response = await axios.post(`/api/news/${news._id}/like`, { previousAction: userAction });
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);
      setUserAction('liked');
      saveUserAction('liked');
    } catch (error) {
      console.error('Error liking news:', error);
    }
  };

  const handleDislike = async (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    
    // If user already disliked, do nothing (can't dislike multiple times)
    if (userAction === 'disliked') return;

    try {
      const response = await axios.post(`/api/news/${news._id}/dislike`, { previousAction: userAction });
      setDislikes(response.data.dislikes);
      setLikes(response.data.likes);
      setUserAction('disliked');
      saveUserAction('disliked');
    } catch (error) {
      console.error('Error disliking news:', error);
    }
  };

  // For feature card
  if (isFeature) {
    return (
      <motion.article 
        className="feature__card"
        whileHover={{ 
          y: -5,
          transition: { type: "spring", stiffness: 300 }
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to={`/news/${news._id}`} className="feature__card-link">
          <div className="feature__image-container">
            <img 
              src={news.imageUrl || 'https://via.placeholder.com/800x400?text=No+Image'} 
              alt={news.title} 
              className="feature__image" 
              loading="lazy"
            />
            <div className="feature__overlay"></div>
          </div>
          <div className="feature__content">
            <h3 className="feature__heading">{news.title}</h3>
            <div className="feature__meta">
              {displayCategory && <span className="feature__category">{displayCategory}</span>}
              <time className="feature__date">{new Date(news.publishDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</time>
              {news.author && <span className="feature__author">By {news.author}</span>}
            </div>
            {news.summary && (
              <p className="feature__summary">{news.summary}</p>
            )}
          </div>
        </Link>
      </motion.article>
    );
  }

  // For trending card
  if (isTrending) {
    return (
      <motion.article 
        className="trending__card"
        whileHover={{ x: 4, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to={`/news/${news._id}`} className="trending__card-link">
          <div className="trending__image-wrapper">
            <img 
              src={news.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image'} 
              alt={news.title} 
              className="trending__image" 
              loading="lazy" 
            />
          </div>
          <div className="trending__content">
            <h4 className="trending__heading">{news.title}</h4>
            <time className="trending__date">{new Date(news.publishDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</time>
          </div>
        </Link>
      </motion.article>
    );
  }

  // Default (latest) card
  return (
    <motion.article 
      className="latest__card"
      whileHover={{ 
        y: -5, 
        boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
        transition: { duration: 0.2 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/news/${news._id}`} className="latest__card-link">
        <div className="latest__image-wrapper">
          <img 
            src={news.imageUrl || 'https://via.placeholder.com/400x250?text=No+Image'} 
            alt={news.title} 
            className="latest__image" 
            loading="lazy"
          />
          {displayCategory && <span className="latest__category-badge">{displayCategory}</span>}
        </div>
        <div className="latest__content">
          <h4 className="latest__heading">{news.title}</h4>
          <time className="latest__date">{new Date(news.publishDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</time>
          {news.summary && <p className="latest__summary">{news.summary.substring(0, 120)}...</p>}
        </div>
      </Link>
      <div className="latest__actions">
        <button onClick={handleLike} className={`action-button like-button ${userAction === 'liked' ? 'active' : ''}`}>
          <FaThumbsUp /> <span>{likes}</span>
        </button>
        <button onClick={handleDislike} className={`action-button dislike-button ${userAction === 'disliked' ? 'active' : ''}`}>
          <FaThumbsDown /> <span>{dislikes}</span>
        </button>
      </div>
    </motion.article>
  );
}

export default NewsCard;
