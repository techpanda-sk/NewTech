import React from "react";
import { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: "",  // Changed from email to username
    password: ""
  });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    general: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
        general: ""
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: "",
      password: "",
      general: ""
    };

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: "" }));

    try {
      const response = await axios.post(
        "https://app-ql6v.onrender.com/api/admin/login",
        // "http://msme.drunkcafe.in/api/admin/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      // Handle successful login
      if (response.data && response.data.token) {
        // Store the token in localStorage or context
        localStorage.setItem("adminToken", response.data.token);
        
        // Redirect to admin dashboard
        navigate("/table");
      } else {
        setErrors(prev => ({
          ...prev,
          general: "Invalid response from server"
        }));
      }
    } catch (error) {
      // Handle different error cases
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 401) {
          setErrors(prev => ({
            ...prev,
            general: "Invalid username or password"
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: error.response.data.message || "Login failed"
          }));
        }
      } else if (error.request) {
        // The request was made but no response was received
        setErrors(prev => ({
          ...prev,
          general: "Network error. Please try again."
        }));
      } else {
        // Something happened in setting up the request
        setErrors(prev => ({
          ...prev,
          general: "An error occurred. Please try again."
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-blue-100 mt-1">Access your admin dashboard</p>
          </div>
          
          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-6 mt-6 rounded">
              <p>{errors.general}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Username Field (replaced email) */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  className={`w-full pl-10 pr-3 py-3 border ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  placeholder="Enter your username"
                  onChange={handleChange}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  className={`w-full pl-10 pr-10 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400 hover:text-gray-600 transition" />
                  ) : (
                    <FaEye className="text-gray-400 hover:text-gray-600 transition" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ${
                isLoading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Signing in...
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;