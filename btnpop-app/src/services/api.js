import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor for JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with an error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
          break;
        case 403:
          // Forbidden - user doesn't have necessary permissions
          console.error('Access forbidden. You do not have permission to perform this action.');
          break;
        case 404:
          // Not found
          console.error('Resource not found.');
          break;
        case 500:
          // Server error
          console.error('Server error occurred. Please try again later.');
          break;
        default:
          // Other error responses
          console.error(`Error ${error.response.status}: ${error.response.data.message || 'Something went wrong'}`);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network issue. Server is not responding.');
    } else {
      // Error in setting up the request
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// News API
const newsApi = {
  // Get all news with optional pagination, filtering and search
  getAllNews: async (page = 1, limit = 10, filters = {}) => {
    try {
      // Build query string from filters
      const params = new URLSearchParams({
        page,
        limit
      });
      
      // Add any filters that are provided
      if (filters.category) params.append('category', filters.category);
      if (filters.featured !== undefined) params.append('featured', filters.featured);
      if (filters.trending !== undefined) params.append('trending', filters.trending);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await apiClient.get(`/news?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get featured news
  getFeaturedNews: async (limit = 6) => {
    try {
      const response = await apiClient.get(`/news/featured?limit=${limit}`); // Corrected endpoint
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get trending news (by engagement)
  getTrendingNews: async (limit = 5) => {
    try {
      // No need to pass limit as a query param if the backend controller for /news/trending now hardcodes it to 5
      const response = await apiClient.get('/news/trending'); 
      return response.data; // Ensure this returns { news: [...] }
    } catch (error) {
      throw error;
    }
  },
  
  // Search news by keyword
  searchNews: async (query, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/news?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single news by id
  getNewsById: async (id) => {
    try {
      const response = await apiClient.get(`/news/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new news (admin only)
  createNews: async (newsData) => {
    try {
      const formData = new FormData();
      
      // Append all text fields
      for (const key in newsData) {
        if (key !== 'image') {
          formData.append(key, newsData[key]);
        }
      }
      
      // Append image if exists
      if (newsData.image && newsData.image instanceof File) {
        formData.append('image', newsData.image);
      }
      
      const response = await apiClient.post('/news', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update news (admin only)
  updateNews: async (id, newsData) => {
    try {
      const formData = new FormData();
      
      // Append all text fields
      for (const key in newsData) {
        if (key !== 'image') {
          formData.append(key, newsData[key]);
        }
      }
      
      // Append image if exists
      if (newsData.image && newsData.image instanceof File) {
        formData.append('image', newsData.image);
      }
      
      const response = await apiClient.put(`/news/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete news (admin only)
  deleteNews: async (id) => {
    try {
      const response = await apiClient.delete(`/news/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Events API
const eventsApi = {
  // Get all events with optional pagination, filtering and search
  getAllEvents: async (page = 1, limit = 10, filters = {}) => {
    try {
      // Build query string from filters
      const params = new URLSearchParams({
        page,
        limit
      });
      
      // Add any filters that are provided
      if (filters.location) params.append('location', filters.location);
      if (filters.upcoming !== undefined) params.append('upcoming', filters.upcoming);
      if (filters.past !== undefined) params.append('past', filters.past);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await apiClient.get(`/events?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get upcoming events
  getUpcomingEvents: async (limit = 5) => {
    try {
      const response = await apiClient.get(`/events?upcoming=true&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get past events
  getPastEvents: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/events?past=true&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Search events by keyword
  searchEvents: async (query, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/events?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single event by id
  getEventById: async (id) => {
    try {
      const response = await apiClient.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new event (admin only)
  createEvent: async (eventData) => {
    try {
      const formData = new FormData();
      
      // Append all text fields
      for (const key in eventData) {
        if (key !== 'image') {
          formData.append(key, eventData[key]);
        }
      }
      
      // Append image if exists
      if (eventData.image && eventData.image instanceof File) {
        formData.append('image', eventData.image);
      }
      
      const response = await apiClient.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update event (admin only)
  updateEvent: async (id, eventData) => {
    try {
      const formData = new FormData();
      
      // Append all text fields
      for (const key in eventData) {
        if (key !== 'image') {
          formData.append(key, eventData[key]);
        }
      }
      
      // Append image if exists
      if (eventData.image && eventData.image instanceof File) {
        formData.append('image', eventData.image);
      }
      
      const response = await apiClient.put(`/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete event (admin only)
  deleteEvent: async (id) => {
    try {
      const response = await apiClient.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Auth API
const authApi = {
  // Login
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Request password reset (forgot password)
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Reset password with token
  resetPassword: async (token, password, confirmPassword) => {
    try {
      const response = await apiClient.post(`/auth/reset-password/${token}`, { 
        password, 
        confirmPassword 
      });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export { newsApi, eventsApi, authApi };
