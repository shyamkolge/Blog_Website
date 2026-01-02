import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useSidebar } from "../../context/SidebarContext";
import { useTheme } from "../../context/ThemeContext";
import { FiMenu, FiSearch, FiUser, FiLogOut, FiSettings, FiEdit3, FiChevronDown, FiSun, FiMoon } from "react-icons/fi";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { open: openSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setProfileDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Hamburger Menu & Logo */}
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu - Always visible on mobile, hidden on desktop when sidebar is visible */}
            <button
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
              onClick={openSidebar}
              title="Open menu"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            
            {/* Logo */}
            <div 
              className="text-2xl font-bold cursor-pointer text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition"
              onClick={() => navigate("/")}
            >
              Medium
            </div>
          </div>

          {/* Center - Search (Desktop only) */}
          <div className="hidden md:flex items-center flex-1 justify-center max-w-md mx-8">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors"
              />
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
              }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <FiMoon className="w-5 h-5" />
              ) : (
                <FiSun className="w-5 h-5" />
              )}
            </button>
            {!user ? (
              <>
                {/* Desktop - Sign in & Get started */}
                <div className="hidden md:flex items-center space-x-4">
                  <button
                    className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition px-4 py-2"
                    onClick={() => navigate("/login")}
                  >
                    Sign in
                  </button>
                  <button
                    className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                    onClick={() => navigate("/register")}
                  >
                    Get started
                  </button>
                </div>
                {/* Mobile - Sign in button */}
                <button
                  className="md:hidden text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition px-3 py-2"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                {/* Write Button - Desktop only */}
                <button
                  className="hidden md:flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition px-4 py-2"
                  onClick={() => navigate("/write")}
                >
                  <FiEdit3 className="w-5 h-5" />
                  <span>Write</span>
                </button>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                    <FiChevronDown 
                      className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      
                      <div className="py-1">
                        <button
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          onClick={() => {
                            navigate("/profile");
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <FiUser className="w-4 h-4" />
                          <span>Profile</span>
                        </button>
                        
                        <button
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition md:hidden"
                          onClick={() => {
                            navigate("/write");
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <FiEdit3 className="w-4 h-4" />
                          <span>Write</span>
                        </button>
                        
                        <button
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          onClick={() => {
                            navigate("/settings");
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <FiSettings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        
                        <button
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          onClick={handleLogout}
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
