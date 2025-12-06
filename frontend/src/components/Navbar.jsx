import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';


export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme(); 

  const userType = localStorage.getItem('userType') || 'Personal';

  const baseLinks = [
    { name: 'Dash Board', path: '/dashboard' },
    { name: 'Summary', path: '/summary' },
  ];

  const addExpenseLink =
    userType === 'Business'
      ? { name: 'Add Expenses', path: '/add-expenses-business' }
      : { name: 'Add Expenses', path: '/add-expenses-personal' };

  const navLinks = [...baseLinks.slice(0, 1), addExpenseLink, ...baseLinks.slice(1)];


  return (
    <header className="w-full bg-white dark:bg-[#111] sticky top-0 z-100 shadow-md dark:shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-colors duration-300">
      <nav className="max-w-[1450px] mx-auto flex items-center justify-between py-4 px-4">
        
        {/* Logo */}
        <div className="flex items-center text-4xl font-bold tracking-wide shrink-0">
          <span className="text-[#EFB506] transition-colors">Penny</span>
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
                  className={`relative group text-lg font-medium transition-all duration-300 hover:scale-105 
                    ${isActive 
                      ? 'text-[#EFB506]' 
                      : 'text-gray-600 dark:text-white hover:text-[#EFB506] dark:hover:text-[#EFB506]'
                    }`}
                >
                  {link.name}
                  <span className={`absolute left-0 -bottom-1 w-full h-0.5 bg-[#EFB506] transition-transform duration-300 origin-left
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
              to="/"
              className="flex items-center gap-2 bg-gray-100 dark:bg-[#444] text-gray-700 dark:text-white text-base font-semibold px-[18px] py-2 rounded-[7px] transition-all duration-300 hover:bg-[#EFB506] hover:text-[#111] hover:scale-105 shrink-0"
            >
              Logout <FiLogOut className="text-lg" />
            </Link>
        </div>

      </nav>
    </header>
  );
}