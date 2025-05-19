import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { newsApi, eventsApi, authApi } from '../../services/api';
import { FaNewspaper, FaCalendarAlt, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaThumbsUp, FaThumbsDown, FaUsers } from 'react-icons/fa';
import './admindashbord.css';
import NewsForm from '../../Components/AdminDashboard/NewsForm';
import EventForm from '../../Components/AdminDashboard/EventForm';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authApi.isLoggedIn()) {
          navigate('/admin/login');
          return;
        }
        
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Authentication error:', err);
        authApi.logout();
        navigate('/admin/login');
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('events')) {
      setActiveTab('events');
    } else {
      setActiveTab('news');
    }
  }, [location]);
  
  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (activeTab === 'news') {
          const response = await newsApi.getAllNews(1, 100);
          setNews(response.news || []); // Ensure news is an array
        } else {
          const response = await eventsApi.getAllEvents(1, 100);
          setEvents(response.events || []); // Ensure events is an array
        }
      } catch (err) {
        console.error(`Error fetching ${activeTab}:`, err);
        setError(`Failed to load ${activeTab}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [activeTab, user]);
  
  // Handle logout
  const handleLogout = () => {
    authApi.logout();
    navigate('/admin/login');
  };
  
  // Handle create new item
  const handleCreate = () => {
    setCurrentItem(null);
    setIsFormOpen(true);
  };
  
  // Handle edit item
  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsFormOpen(true);
  };
  
  // Handle delete item
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      if (activeTab === 'news') {
        await newsApi.deleteNews(id);
        setNews(news.filter(item => item._id !== id));
      } else {
        await eventsApi.deleteEvent(id);
        setEvents(events.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error(`Error deleting ${activeTab}:`, err);
      alert(`Failed to delete ${activeTab}. Please try again.`);
    }
  };
  
  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      let responseData;
      
      if (activeTab === 'news') {
        if (currentItem) {
          const response = await newsApi.updateNews(currentItem._id, formData);
          responseData = response; 
          console.log('AdminDashboard update news responseData:', responseData); // New log
          if (responseData && responseData._id) {
            setNews(news.map(item => item._id === currentItem._id ? responseData : item));
          } else {
            console.error("Update news response did not contain an item:", response);
            // Optionally, refetch all news or show an error
            // For now, just log and don't update the local state to avoid further errors
          }
        } else {
          const response = await newsApi.createNews(formData);
          responseData = response; 
          console.log('AdminDashboard create news responseData:', responseData); // New log
          if (responseData && responseData._id) {
            setNews([responseData, ...news]);
          } else {
            console.error("Create news response did not contain an item:", response);
          }
        }
      } else {
        if (currentItem) {
          const response = await eventsApi.updateEvent(currentItem._id, formData);
          responseData = response; // Corrected: response is the updated item
          if (responseData && responseData._id) {
            setEvents(events.map(item => item._id === currentItem._id ? responseData : item));
          } else {
            console.error("Update event response did not contain an item:", response);
          }
        } else {
          const response = await eventsApi.createEvent(formData);
          responseData = response; // Corrected: response is the new item
          if (responseData && responseData._id) {
            setEvents([responseData, ...events]);
          } else {
            console.error("Create event response did not contain an item:", response);
          }
        }
      }
      
      setIsFormOpen(false);
      setCurrentItem(null);
    } catch (err) {
      console.error(`Error saving ${activeTab}:`, err);
      alert(`Failed to save ${activeTab}. Please try again.`);
    }
  };
  
  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentItem(null);
  };
  
  // Render the form based on active tab
  const renderForm = () => {
    if (!isFormOpen) return null;
    
    return activeTab === 'news' 
      ? <NewsForm 
          news={currentItem} 
          onSubmit={handleFormSubmit} 
          onCancel={handleCloseForm} 
        />
      : <EventForm 
          event={currentItem} 
          onSubmit={handleFormSubmit} 
          onCancel={handleCloseForm} 
        />;
  };
  
  // Render news list
  const renderNewsList = () => {
    if (loading) {
      return <div className="admin-dashboard__loading">Loading news...</div>;
    }
    
    if (error) {
      return <div className="admin-dashboard__error">{error}</div>;
    }
    
    if (news.length === 0) {
      return <div className="admin-dashboard__empty">No news articles found.</div>;
    }
    
    return (
      <div className="admin-dashboard__list">
        {news.map((item) => {
          const totalEngagement = (item.likes || 0) + (item.dislikes || 0);
          return (
            <div key={item._id} className="admin-dashboard__item">
              <div className="admin-dashboard__item-image">
                <img src={item.imageUrl || 'https://via.placeholder.com/300x180?text=No+Image'} alt={item.title} />
              </div>
              <div className="admin-dashboard__item-content">
                <h3 className="admin-dashboard__item-title">{item.title}</h3>
                <div className="admin-dashboard__item-meta">
                  <time className="admin-dashboard__item-date">
                    {new Date(item.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </time>
                  {item.category && item.category !== 'General' && (
                    <span className="admin-dashboard__item-category">{item.category}</span>
                  )}
                </div>
                {item.summary && (
                  <p className="admin-dashboard__item-summary">{item.summary}</p>
                )}
                <div className="admin-dashboard__item-engagement">
                  <span className="engagement-stat likes"><FaThumbsUp /> {item.likes || 0}</span>
                  <span className="engagement-stat dislikes"><FaThumbsDown /> {item.dislikes || 0}</span>
                  <span className="engagement-stat total-engagement"><FaUsers /> {totalEngagement}</span>
                </div>
              </div>
              <div className="admin-dashboard__item-actions">
                <button 
                  className="admin-dashboard__action-btn admin-dashboard__action-btn--edit"
                  onClick={() => handleEdit(item)}
                >
                  <FaEdit />
                </button>
                <button 
                  className="admin-dashboard__action-btn admin-dashboard__action-btn--delete"
                  onClick={() => handleDelete(item._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render events list
  const renderEventsList = () => {
    if (loading) {
      return <div className="admin-dashboard__loading">Loading events...</div>;
    }
    
    if (error) {
      return <div className="admin-dashboard__error">{error}</div>;
    }
    
    if (events.length === 0) {
      return <div className="admin-dashboard__empty">No events found.</div>;
    }
    
    return (
      <div className="admin-dashboard__list">
        {events.map((item) => (
          <div key={item._id} className="admin-dashboard__item">
            <div className="admin-dashboard__item-image">
              <img src={item.image || 'https://via.placeholder.com/100x100?text=No+Image'} alt={item.title} />
            </div>
            <div className="admin-dashboard__item-content">
              <h3 className="admin-dashboard__item-title">{item.title}</h3>
              <time className="admin-dashboard__item-date">
                {new Date(item.date).toLocaleDateString()}
              </time>
              <div className="admin-dashboard__item-location">
                {item.location || 'No location specified'}
              </div>
            </div>
            <div className="admin-dashboard__item-actions">
              <button 
                className="admin-dashboard__action-btn admin-dashboard__action-btn--edit"
                onClick={() => handleEdit(item)}
              >
                <FaEdit />
              </button>
              <button 
                className="admin-dashboard__action-btn admin-dashboard__action-btn--delete"
                onClick={() => handleDelete(item._id)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!user) {
    return <div className="admin-dashboard__loading">Authenticating...</div>;
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-dashboard__sidebar">
        <div className="admin-dashboard__logo">
          <h1>BTN Admin</h1>
        </div>
        <nav className="admin-dashboard__nav">
          <button 
            className={`admin-dashboard__nav-btn ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <FaNewspaper />
            <span>News</span>
          </button>
          <button 
            className={`admin-dashboard__nav-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <FaCalendarAlt />
            <span>Events</span>
          </button>
        </nav>
        <div className="admin-dashboard__user">
          <div className="admin-dashboard__user-name">
            {user.name || user.username}
          </div>
          <button className="admin-dashboard__logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <main className="admin-dashboard__main">
        <header className="admin-dashboard__header">
          <h2 className="admin-dashboard__title">
            {activeTab === 'news' ? 'News Management' : 'Events Management'}
          </h2>
          <button 
            className="admin-dashboard__create-btn"
            onClick={handleCreate}
          >
            <FaPlus />
            <span>Create {activeTab === 'news' ? 'News' : 'Event'}</span>
          </button>
        </header>
        
        <div className="admin-dashboard__content">
          {activeTab === 'news' ? renderNewsList() : renderEventsList()}
        </div>
        
        {isFormOpen && (
          <div className="admin-dashboard__modal">
            <div className="admin-dashboard__modal-content">
              {renderForm()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;