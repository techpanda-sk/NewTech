import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
// import Sidebar from "../Sidebar";
import Navbar from "../NavBar/Navbar";
import { LayoutContext } from "./LayoutProvider";

const Layout = () => {
  const { darkMode, sidebarOpen } = useContext(LayoutContext);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <Navbar />
      
      <div className="flex flex-1 relative">
    
        {/* <Sidebar /> */}
        
        
        <main className={`flex-1 transition-all duration-300  ${
          sidebarOpen ? 'md:ml-0' : 'ml-0'
        }
         ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} `}>
          {/* Replace children with Outlet */}
          <div className={`border ${darkMode ? "border-gray-500" : "border-gray-200"}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;