import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import Summary from './pages/Summary';
import AddExpenses from './pages/AddExpenses-business';

// Placeholder for Dashboard if you don't have it yet
const Dashboard = () => <div className="p-10 text-center dark:text-white">Dashboard Page</div>;

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-[#111] transition-colors duration-300">
        {/* Navbar sits here, OUTSIDE the Routes, so it appears on every page */}
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Navigate to="/summary" replace />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/add-expenses" element={<AddExpenses />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;