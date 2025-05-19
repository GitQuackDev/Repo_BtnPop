import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import ArticlePage from './pages/ArticlePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import AboutPage from './pages/AboutPage';
import Navbar from './Components/Navbar/navbar';
import HomeNavbar from './Components/Navbar/HomeNavbar';
import Footer from './Components/Footer/footer';
import Preloader from './Components/Preloader/Preloader';
import './App.css';

// Import admin components
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashbard';
import ForgotPassword from './pages/admin/ForgotPassword';
import ResetPassword from './pages/admin/ResetPassword';
import { authApi } from './services/api';

// PrivateRoute component for protected routes
const PrivateRoute = ({ children }) => {
  return authApi.isLoggedIn() ? children : <Navigate to="/admin/login" replace />;
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function NavigationWrapper() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin'); // Check if it's an admin page

  if (isAdminPage) {
    return null; // Don't render Navbar for admin pages
  }

  return (
    <>
      {isHomePage ? <HomeNavbar /> : <Navbar />}
    </>
  );
}

function AppContent() {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin'); // Check if it's an admin page

  useEffect(() => {
    // Show loader immediately
    setLoading(true);

    // Store the next page content
    const nextPage = (
      <div className='app'>
        <NavigationWrapper />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />            <Route path="/news" element={<NewsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/news/:id" element={<ArticlePage />} />
            {/* Admin Routes - these will now use their own layout defined within AdminDashboard */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
            {/* Fallback for any other non-matching routes - consider if this is desired for admin too */}
            {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
          </Routes>
        </main>
        {isAdminPage ? null : <Footer />} {/* Don't render Footer for admin pages */}
      </div>
    );

    // Delay showing the next page
    const timer = setTimeout(() => {
      setCurrentPage(nextPage);
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [location, isAdminPage]); // Added isAdminPage to dependency array

  return (
    <>
      {loading && <Preloader />}
      {!loading && currentPage}
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;