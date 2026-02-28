import React from 'react';
import { Search, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

const Topbar = ({ onMenuClick }) => {
  const user = authService.getCurrentUser();
  const name = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) || 'Admin User';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="flex items-center justify-between px-6 lg:px-10 h-16 bg-transparent">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden sm:flex items-center bg-[#EEE7E1] px-4 py-2.5 rounded-full w-64 md:w-96">
          <Search size={18} className="text-gray-500 mr-2.5" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="bg-transparent border-none outline-none text-sm w-full text-[#333]"
          />
        </div>
      </div>
      
      <Link 
        to="/profile" 
        className="flex items-center p-1.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="w-9 h-9 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
          {initials}
        </div>
        <span className="hidden sm:inline text-sm font-semibold text-[#333] pr-2">{name}</span>
      </Link>
    </header>
  );
};

export default Topbar;
