import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLogOut, FiSun, FiMoon, FiChevronDown } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { getUserType } from "../utils/UserType";

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const userType = getUserType();
  const addExpensePath =
  userType === "business"
    ? "/add-expenses-business"
    : "/add-expenses";

  const navLinks = [
    { name: 'Dash Board', path: '/dashboard' },
    { name: 'Add Expenses', path: addExpensePath }, 
    { name: 'Summary', path: '/summary' },
  ];

  return (
    <header className="w-full bg-gradient-to-r from-white to-white/95 dark:from-[#0a0a0a] dark:to-[#111]/95 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
      <nav className="max-w-[1450px] mx-auto flex items-center justify-between py-3 px-6">
        
        {/* Logo with User Type Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center text-4xl font-bold tracking-wide relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EFB506] to-[#FFD700] transition-colors">
              Penny
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B600] to-[#00FF80] ml-1">
              Pal
            </span>
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-[#EFB506] via-[#00B600] to-transparent rounded-full"></div>
          </div>
          
          {/* User Type Badge */}
          <div className={`relative group ${userType === 'Business' ? 'cursor-pointer' : ''}`}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300
              ${userType === 'Business' 
                ? 'bg-gradient-to-r from-[#00B600]/20 to-[#00B600]/10 text-[#00B600] border border-[#00B600]/30 hover:from-[#00B600]/30 hover:to-[#00B600]/20 hover:scale-105' 
                : 'bg-gradient-to-r from-[#EFB506]/20 to-[#EFB506]/10 text-[#EFB506] border border-[#EFB506]/30'
              }`}>
              <span>{userType}</span>
              {userType === 'Business' && <FiChevronDown className="text-[10px] opacity-70 group-hover:rotate-180 transition-transform" />}
            </div>
            
            {/* Business Tooltip */}
            {userType === 'Business' && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Business Account</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Advanced features enabled for business expense tracking</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links - Blinking animation stops immediately */}
        <ul className="flex items-center gap-6 lg:gap-10 mx-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path} className="relative">
                <Link
                  to={link.path}
                  className={`
                    relative group text-base font-medium px-1 py-2
                    transition-colors duration-300
                    ${isActive 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#EFB506] via-[#FFB300] to-[#EFB506] brightness-110' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#EFB506] dark:hover:text-[#EFB506]'
                    }
                  `}
                >
                  {/* Text Content */}
                  {link.name}
                  
                  {/* Blinking Gradient Underline - Stops immediately when inactive */}
                  <span className={`
                    absolute left-0 bottom-0 w-full h-[2px] rounded-full
                    ${isActive 
                      ? 'scale-x-100 bg-gradient-to-r from-[#EFB506] via-[#FFB300] to-[#00B600] animate-softPulse' 
                      : 'scale-x-0 group-hover:scale-x-75 bg-gradient-to-r from-[#EFB506] to-[#FFB300]'
                    }
                    transition-transform duration-300
                  `}></span>
                  
                  {/* Static Glow Effect - No transition */}
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 w-3/4 h-1 bg-gradient-to-r from-[#EFB506]/30 to-[#00B600]/30 blur-sm -translate-x-1/2 rounded-full"></span>
                  )}
                  
                  {/* Hover Background Glow */}
                  <span className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-[#EFB506]/0 to-transparent group-hover:via-[#EFB506]/5 rounded-md transition-all duration-300"></span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Theme Toggle & Logout */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#222] dark:to-[#333] hover:from-gray-100 hover:to-gray-200 dark:hover:from-[#333] dark:hover:to-[#444] transition-all duration-300 group border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
            title="Toggle Theme"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#EFB506]/0 via-[#EFB506]/0 to-[#00B600]/0 group-hover:from-[#EFB506]/10 group-hover:via-[#EFB506]/5 group-hover:to-[#00B600]/10 transition-all duration-500"></div>
            {theme === 'dark' ? (
              <FiSun className="text-xl text-yellow-400 relative z-10 transform group-hover:rotate-12 transition-transform" />
            ) : (
              <FiMoon className="text-xl text-gray-700 relative z-10 transform group-hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>

          {/* Logout Button */}
          <Link
            to="/"
            className="group relative overflow-hidden flex items-center gap-2.5 text-base font-medium px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#222] dark:to-[#333] transition-all duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#EFB506]/0 to-[#EFB506]/0 group-hover:from-[#EFB506]/20 group-hover:to-[#00B600]/10 transition-all duration-300"></div>
            <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-[#EFB506]/30 transition-all duration-300"></div>
            <span className="relative z-10 text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
              Logout
            </span>
            <FiLogOut className="relative z-10 text-lg text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300 group-hover:translate-x-1" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent group-hover:via-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </Link>
        </div>
      </nav>
      
      {/* Add custom blinking animation */}
      <style jsx>{`
        @keyframes softPulse {
          0%, 100% {
            opacity: 0.7;
            box-shadow: 0 0 5px rgba(239, 181, 6, 0.3);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 10px rgba(239, 181, 6, 0.6);
          }
        }
        
        .animate-softPulse {
          animation: softPulse 1.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </header>
  );
}