import React, { useState } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

interface User {
  username: string;
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
  query: string;
  setQuery: (query: string) => void;
  onSearch: () => void;
  onSectionChange: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  query,
  setQuery,
  onSearch,
  onSectionChange
}) => {
  const { toggleSidebar } = useSidebar();
  const [showUserInfo, setShowUserInfo] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
      onSectionChange('search');
    }
  };

  const handleClick = () => {
    onSearch();
    onSectionChange('search');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-6 bg-black/50 backdrop-blur-md border-b border-purple-800/30">

      {/* Sidebar toggle button */}
      <button
        onClick={toggleSidebar}
        className="p-2 bg-purple-600/20 rounded-full hover:bg-purple-600/40 transition-colors"
      >
        <Menu className="w-5 h-5 text-purple-300" />
      </button>

      {/* Search bar */}
        <div className="flex-1 w-full px-4 sm:px-6 md:px-8 max-w-2xl mx-auto">
          <div className="relative w-full flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What do you want to listen to?"
              className="w-full pr-24 sm:pr-28 pl-4 py-2 sm:py-3 rounded-full text-white bg-white/10 border border-purple-400/30 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition text-sm sm:text-base"
            />
            <button
              onClick={handleClick}
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full text-xs sm:text-sm font-medium transition-all"
            >
              Search
            </button>
          </div>
        </div>

      {/* User info and logout */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 rounded-full text-red-300 hover:text-red-200 font-medium transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>

        <div
          className="relative"
          onMouseEnter={() => setShowUserInfo(true)}
          onMouseLeave={() => setShowUserInfo(false)}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-white font-medium text-sm">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>

          {showUserInfo && (
            <div className="absolute top-12 right-0 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50">
              <p className="text-sm font-medium">{user.username}</p>
              <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
