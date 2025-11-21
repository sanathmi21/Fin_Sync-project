import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi'; 
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Dash Board', path: '/dashboard' },
    { name: 'Add Expenses', path: '/add-expenses' },
    { name: 'Summary', path: '/summary' },
  ];

  return (
    <header className="header">
      <nav className="navbar">
        {/* Logo */}
        <div className="logo">
          <span className="logoYellow">Penny</span>
          <span className="logoGreen">Pal</span>
        </div>

        {/* Navigation Links */}
        <ul className="navLinks">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`navLink ${location.pathname === link.path ? 'activeLink' : ''}`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <a href="/logout" className="logoutBtn">
          Logout <FiLogOut className="logoutIcon" />
        </a>
      </nav>
    </header>
  );
}
