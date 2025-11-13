import { NavLink } from "react-router-dom";
import { Home, Info, BookOpen } from 'lucide-react';
import { useState } from "react";

function NavBar() {
  const NavItem = ({ to, children, end = false }) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          isActive
            ? "text-blue-400 bg-gray-800 shadow-md font-semibold"
            : "text-white hover:text-blue-400 hover:bg-gray-700"
        }`
      }
    >
      {children}
    </NavLink>
  );

  return (
    <nav className="top-0 z-50 w-full backdrop-blur-sm bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-1">
            <NavItem to="/" end>
              <Home className="w-4 h-4" />
              <span>Home</span>
            </NavItem>
            
            <NavItem to="/about">
              <Info className="w-4 h-4" />
              <span>About</span>
            </NavItem>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
