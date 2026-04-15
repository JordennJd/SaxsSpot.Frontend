import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateOnly } from '@/lib/utils';

export const Header = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 to-purple-900 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              <span className="text-cyan-300">Saxs</span>
              <span className="text-purple-400">Spot</span>
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block ml-auto">
            <ul className="flex space-x-4 lg:space-x-6 font-mono">
              <li 
                onClick={() => navigate('/')} 
                className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center cursor-pointer text-sm lg:text-base"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Experiments
              </li>
              <li className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center cursor-pointer text-sm lg:text-base">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Analysis
              </li>
              <li 
                onClick={() => navigate('/jobs')} 
                className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center cursor-pointer text-sm lg:text-base"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Jobs
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white p-2 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors touch-manipulation"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-3 pb-2 border-t border-white border-opacity-20">
            <ul className="flex flex-col space-y-2 pt-2 font-mono">
              <li 
                onClick={() => handleNavClick('/')} 
                className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center cursor-pointer py-2 px-2 rounded-md hover:bg-white hover:bg-opacity-10 touch-manipulation"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Experiments
              </li>
              <li className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center cursor-pointer py-2 px-2 rounded-md hover:bg-white hover:bg-opacity-10 touch-manipulation">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Analysis
              </li>
              <li 
                onClick={() => handleNavClick('/jobs')} 
                className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center cursor-pointer py-2 px-2 rounded-md hover:bg-white hover:bg-opacity-10 touch-manipulation"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Jobs
              </li>
            </ul>
          </nav>
        )}
      </div>
      
      {/* Status bar */}
      <div className="bg-white bg-opacity-20 text-xs text-blue-100 py-1 px-3 sm:px-4 font-mono">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
          <span className="truncate">Status: <span className="text-green-400">Online</span></span>
          <span className="hidden sm:inline">Last: {formatDateOnly(new Date())}</span>
          <span className="hidden md:inline">v1.0.0</span>
        </div>
      </div>
    </header>
  );
}; 