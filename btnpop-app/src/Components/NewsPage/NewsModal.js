import React, { useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import './NewsModal.css';
import { motion, AnimatePresence } from 'framer-motion';

function NewsModal({ news, isOpen, onClose }) {
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

  // If there's no news data or modal is closed, return null
  if (!news || !isOpen) return null;

  // Format date
  const formattedDate = new Date(news.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Handle social media sharing
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = news.title;
    
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="news-modal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="news-modal"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button 
              className="news-modal__close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <IoMdClose />
            </button>
            
            <div className="news-modal__hero">
              <img 
                src={news.image || 'https://via.placeholder.com/1200x600?text=No+Image'} 
                alt={news.title} 
                className="news-modal__image" 
              />
            </div>
            
            <div className="news-modal__content">
              <header className="news-modal__header">
                <div className="news-modal__meta">
                  <time className="news-modal__date">{formattedDate}</time>
                  {news.author && (
                    <span className="news-modal__author">By {news.author}</span>
                  )}
                </div>
                <h1 className="news-modal__title">{news.title}</h1>
              </header>
              
              <div 
                className="news-modal__body"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
              
              <div className="news-modal__share">
                <h3 className="news-modal__share-title">Share this article</h3>
                <div className="news-modal__share-buttons">
                  <button 
                    onClick={() => handleShare('facebook')}
                    aria-label="Share on Facebook"
                    className="news-modal__share-button news-modal__share-button--facebook"
                  >
                    <FaFacebook />
                  </button>
                  <button 
                    onClick={() => handleShare('twitter')}
                    aria-label="Share on Twitter"
                    className="news-modal__share-button news-modal__share-button--twitter"
                  >
                    <FaTwitter />
                  </button>
                  <button 
                    onClick={() => handleShare('linkedin')}
                    aria-label="Share on LinkedIn"
                    className="news-modal__share-button news-modal__share-button--linkedin"
                  >
                    <FaLinkedin />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NewsModal;
