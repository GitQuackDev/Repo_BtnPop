import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import './articlepage.css';

function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // This would normally fetch from an API
  const article = {
    id,
    title: "BTN Association, as represented by Sir Gabriel Jessie Guevarra, participated in the Balanga City's Creative Burst Workshop.",
    date: "January 1 2025",
    image: '/path-to-image.jpg',
    author: "John Doe",
    content: `
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

      <h2>The Workshop Experience</h2>
      
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    `,
    relatedArticles: [
      // ... related articles data
    ]
  };

  return (
    <>
      <article className="article">
        <button 
          className="article__back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <IoIosArrowBack />
          <span>Back to News</span>
        </button>

        <header className="article__header">
          <div className="article__meta">
            <time className="article__date">{article.date}</time>
            <span className="article__author">By {article.author}</span>
          </div>
          <h1 className="article__title">{article.title}</h1>
        </header>

        <div className="article__hero">
          <img 
            src={article.image} 
            alt={article.title}
            className="article__image"
          />
        </div>

        <div className="article__content">
          <div 
            className="article__body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        <div className="article__share">
          <h3 className="article__share-title">Share this article</h3>
          <div className="article__share-buttons">
            <button aria-label="Share on Facebook">Facebook</button>
            <button aria-label="Share on Twitter">Twitter</button>
            <button aria-label="Share on LinkedIn">LinkedIn</button>
          </div>
        </div>

        <section className="related-articles">
          <h2 className="related-articles__title">Related Articles</h2>
          <div className="related-articles__grid">
            {/* Add related articles here */}
          </div>
        </section>
      </article>
    </>
  );
}

export default ArticlePage;