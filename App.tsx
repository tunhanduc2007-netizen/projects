import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import AdminPanel from './pages/AdminPanel';
import AdminPanelMobile from './pages/AdminPanelMobile';
import './styles/admin.css';
import './styles/shop.css';

// Responsive Admin Component
const ResponsiveAdmin: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <AdminPanelMobile /> : <AdminPanel />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/admin" element={<ResponsiveAdmin />} />
      </Routes>
    </Router>
  );
};

export default App;
