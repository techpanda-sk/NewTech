import React from "react";
import { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchAdminDetails = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        if (!["/login"].includes(location.pathname)) {
          navigate("/login");
        }
        return;
      }

      // Verify token with backend

      if (["/login"].includes(location.pathname)) {
        navigate("/table");
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
    if (location.pathname === "/") {
      navigate("/table");
    }
  };

  useEffect(() => {
    fetchAdminDetails();
  }, [location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AdminContext.Provider value={{ isLoading }}>
      {children}
    </AdminContext.Provider>
  );
};
