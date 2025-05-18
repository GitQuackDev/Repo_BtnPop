import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import EventsPage from './pages/EventsPage';
import AboutPage from './pages/AboutPage';
import Navbar from './Components/Navbar/navbar';
import HomeNavbar from './Components/Navbar/HomeNavbar';
import Footer from './Components/Footer/footer';
import Preloader from './Components/Preloader/Preloader';
import './App.css';

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

  useEffect(() => {
    // Show loader immediately
    setLoading(true);
    
    // Store the next page content
    const nextPage = (
      <div className='app'>
        <NavigationWrapper />
        <main>
          <Routes>
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );

    // Delay showing the next page
    const timer = setTimeout(() => {
      setCurrentPage(nextPage);
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [location]);

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