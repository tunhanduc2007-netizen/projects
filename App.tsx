import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import AdminPanel from './pages/admin/AdminPanel';
import AdminDashboard from './pages/admin/AdminDashboard';
import DatabaseViewer from './pages/admin/DatabaseViewer';
import AdminCleanup from './pages/admin/AdminCleanup';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/database" element={<DatabaseViewer />} />
        <Route path="/cleanup" element={<AdminCleanup />} />
      </Routes>
    </Router>
  );
};

export default App;
