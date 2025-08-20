import React from "react";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { FiSun, FiMoon, FiUser } from "react-icons/fi";
import { MdMenuOpen } from "react-icons/md";
import { LayoutContext } from "../layout/LayoutProvider";

const Navbar = () => {
  const { sidebarOpen, setSidebarOpen, darkMode, setDarkMode } =
    useContext(LayoutContext);

  const [profileOpen, setProfileOpen] = useState(false);
  const toggleProfile = () => setProfileOpen(!profileOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    // localStorage.removeItem("adminData");
    toast.success("Logout successful");
  };

  return (
    <nav
      className={`
      sticky top-0 z-40
      ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} 
      shadow-sm border-b
      ${darkMode ? "border-gray-500" : "border-gray-200"}
    `}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-around items-center h-19">
        <div className="flex items-center gap-4">
          {/* Sidebar toggle button (visible on all screens) */}
          {/* <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle sidebar"
          >
            <MdMenuOpen className=" text-xl" />
          </button> */}

          {/* Desktop Navigation */}
          <div className="flex items-center gap-4">
            <Link
              to="/table"
              className="font-medium hover:text-blue-500 dark:hover:text-blue-400"
            >
              Table
            </Link>
            {/* <Link
              to="/customers"
              className="hover:text-blue-500 dark:hover:text-blue-400"
            >
              Customers
            </Link>
            <Link
              to="/staff"
              className="hover:text-blue-500 dark:hover:text-blue-400"
            >
              Staff
            </Link>
            <Link
              to="/settings"
              className="hover:text-blue-500 dark:hover:text-blue-400"
            >
              Settings
            </Link> */}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={toggleProfile}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="User profile"
            >
              <FiUser size={20} />
            </button>

            {profileOpen && (
              <div
                className={`
                absolute right-0 mt-2 w-48 
                rounded-md shadow-lg py-1 z-50
                ${
                  darkMode
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }
              `}
              >
                {/* <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setProfileOpen(false)}
                >
                  Your Profile
                </Link> */}
                {/* <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setProfileOpen(false)}
                >
                  Settings
                </Link> */}
                {/* <Link
                  to="/register"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setProfileOpen(false)}
                >
                  Staff
                </Link> */}
                <Link
                  to="/login"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleLogout()}
                >
                  Sign out
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
