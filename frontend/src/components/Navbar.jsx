import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// --- INSTRUCTIONS FOR LOCAL PROJECT ---
// 1. Run: npm install react-icons
// 2. Uncomment the real imports below:
// import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
// import { useTheme } from '../context/ThemeContext';
// 3. Delete the "Inline Icons" and "Mock useTheme" sections below.

// --- Inline Icons (Zero Dependency for Preview) ---
const FiSun = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const FiMoon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const FiLogOut = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

// --- Mock useTheme Hook (For Preview Only) ---
// This mimics the behavior of your real ThemeContext so the button works visually here.
const useTheme = () => {
  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // Manually toggle class for preview purposes
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  return { theme, toggleTheme };
};

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme(); // Get theme state

  const navLinks = [
    { name: 'Dash Board', path: '/dashboard' },
    { name: 'Add Expenses', path: '/add-expenses' },
    { name: 'Summary', path: '/summary' },
  ];

  return (
    // Dynamic Header Background: White in Light mode, #111 in Dark mode
    <header className="w-full bg-white dark:bg-[#111] sticky top-0 z-[100] shadow-md dark:shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-colors duration-300">
      <nav className="max-w-[1450px] mx-auto flex items-center justify-between py-4 px-4">
        
        {/* Logo */}
        <div className="flex items-center text-4xl font-bold tracking-wide shrink-0">
          {/* Penny is Dark Gray in Light Mode, Yellow in Dark Mode */}
          <span className="text-gray-800 dark:text-[#EFB506] transition-colors">Penny</span>
          <span className="text-[#00B600] ml-1">Pal</span>
        </div>

        {/* Navigation Links */}
        <ul className="flex items-center gap-8 lg:gap-12 mx-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  // Dynamic Text Colors
                  className={`relative group text-lg font-medium transition-all duration-300 hover:scale-105 
                    ${isActive 
                      ? 'text-[#EFB506]' 
                      : 'text-gray-600 dark:text-white hover:text-[#EFB506] dark:hover:text-[#EFB506]'
                    }`}
                >
                  {link.name}
                  <span className={`absolute left-0 -bottom-1 w-full h-[2px] bg-[#EFB506] transition-transform duration-300 origin-left
                    ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                  `}></span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-gray-100 dark:bg-[#333] hover:bg-gray-200 dark:hover:bg-[#444] transition-colors text-gray-700 dark:text-yellow-400 border border-gray-200 dark:border-transparent cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </button>

            {/* Logout Button */}
            <Link
              to="/logout"
              className="flex items-center gap-2 bg-gray-100 dark:bg-[#444] text-gray-700 dark:text-white text-base font-semibold px-[18px] py-2 rounded-[7px] transition-all duration-300 hover:bg-[#EFB506] hover:text-[#111] hover:scale-105 shrink-0"
            >
              Logout <FiLogOut className="text-lg" />
            </Link>
        </div>

      </nav>
    </header>
  );
}