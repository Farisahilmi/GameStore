import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faGamepad, faUser, faComments } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const MobileBottomNav = ({ user, cartCount, notifications }) => {
  const { theme } = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: faHome, label: 'Home' },
    { path: '/browse', icon: faSearch, label: 'Browse' },
    { path: '/library', icon: faGamepad, label: 'Library' },
    // { path: '/chat', icon: faComments, label: 'Chat', badge: notifications.length > 0 }, // Optional: separate chat page
    { path: `/profile/${user?.id}`, icon: faUser, label: 'Profile' },
  ];

  if (!user) return null; // Only show for logged in users

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${theme.colors.card} border-t ${theme.colors.border} pb-safe`}>
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive(item.path) 
                ? `${theme.colors.accent}` 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="relative">
                <FontAwesomeIcon icon={item.icon} className="text-xl mb-1" />
                {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900"></span>
                )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;