import React, { useEffect } from "react";
import Header from "./Header/Header.jsx";
import Footer from "./Footer/Footer.jsx";
import SideBar from './Sidebar/SideBar.jsx'
import { FiX } from "react-icons/fi";
import { useSidebar } from "../context/SidebarContext";

const Layout = ({ children }) => {
  const { isOpen: sidebarOpen, close: closeSidebar } = useSidebar();

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Header />
      <div className="flex flex-1 relative" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar - Fixed on left, hidden on mobile */}
        <aside className={`
          fixed lg:fixed top-16 left-0 z-50
          w-64 h-[calc(100vh-4rem)] 
          border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900
          overflow-hidden transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
            <button
              onClick={closeSidebar}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-700 dark:text-gray-300"
              aria-label="Close menu"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <SideBar onNavigate={closeSidebar} />
        </aside>
        
        {/* Main Content - Scrollable */}
        <main className="flex-1 w-full lg:ml-64 overflow-y-auto bg-white dark:bg-gray-900 transition-colors" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-full flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
