import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Dash Board', path: '/dashboard' },
    { name: 'Add Expenses', path: '/add-expenses' },
    { name: 'Summary', path: '/summary' },
  ];

  return (
    <header className="w-full bg-[#111] sticky top-0 z-[100] shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
      <nav className="max-w-[1450px] mx-auto flex items-center justify-between py-4 px-4">
        
        {/* Logo */}
        <div className="flex items-center text-4xl font-bold tracking-wide shrink-0">
          <span className="text-[#EFB506]">Penny</span>
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
                    ${isActive ? 'text-[#EFB506]' : 'text-white hover:text-[#EFB506]'}`}
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

        {/* Logout Button - Stays on the Right */}
        <a
          href="/logout"
          className="flex items-center gap-2 bg-[#444] text-white text-base font-semibold px-[18px] py-2 rounded-[7px] transition-all duration-300 hover:bg-[#EFB506] hover:text-[#111] hover:scale-105 shrink-0"
        >
          Logout <FiLogOut className="text-lg" />
        </a>

      </nav>
    </header>
  );
}