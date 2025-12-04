import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import FirstPage from './components/FirstPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import AddExpenses from './pages/AddExpenses-business';

import Summary from './pages/Summary';

function AppContent() {
  const location = useLocation();

  // Hide Navbar on these routes
  const hideNavbarRoutes = ['/', '/signin', '/signup'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] transition-colors duration-300">
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-expenses" element={<AddExpenses />} />
        
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}