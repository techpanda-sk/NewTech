import React from 'react'
import { createContext, useState } from 'react'
export const LayoutContext = createContext();
const LayoutProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen, darkMode, setDarkMode }}>
      {children}
    </LayoutContext.Provider>
  )
};

export default LayoutProvider;