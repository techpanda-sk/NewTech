import React, { useEffect, useState, useContext } from "react";
import config from "../../../../config.json"
import {
  FiSearch,
  FiEye,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiX,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiUser,
} from "react-icons/fi";
import { LayoutContext } from "../layout/LayoutProvider";
import { motion } from "framer-motion";

export default function InteractiveUserTable({
  setSelectedMember,
  setShowMemberDialog,
}) {
  const [users, setUsers] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [deletingId, setDeletingId] = useState(null);
  const { darkMode } = useContext(LayoutContext);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        // "https://msmebackend-9z2p.onrender.com/api/applications",
        `${config.baseUrl}/api/applications`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Process data
  const usersData = Array.isArray(users.data) ? users.data : [];

  // Sorting functionality
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...usersData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Filter users based on search term and status
  const filteredUsers = sortedUsers.filter((user) => {
    const matchesSearch =
      user.applicationNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.unitName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" ||
      (user.status &&
        user.status.toLowerCase() === selectedStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Status configuration
  const statusConfig = {
    approved: {
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: <FiCheckCircle className="mr-1" />,
    },
    pending: {
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: <FiClock className="mr-1" />,
    },
    rejected: {
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      icon: <FiXCircle className="mr-1" />,
    },
    default: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      icon: <FiUser className="mr-1" />,
    },
  };

  // Action handlers
  const handleView = (user) => {
    setSelectedMember(user);
    setShowMemberDialog(true);
  };

  const handleDelete = async (userId) => {
    try {
      setDeletingId(userId);
      const response = await fetch(
        // `https://msmebackend-9z2p.onrender.com/api/applications/${userId}`,
        `${config.baseUrl}api/applications/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setUsers((prev) => ({
          ...prev,
          data: prev.data.filter((user) => user._id !== userId),
        }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete application");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Error deleting application: ${error.message}`);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status?.toLowerCase()] || statusConfig.default;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.icon}
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div
      className={`p-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Application Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all member applications in one place
          </p>
        </div>
        {/* Stats Card */}
        <div
          className={`p-4 rounded-lg shadow ${
            darkMode ? "bg-gray-800" : "bg-white border border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between gap-15">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Applications
              </p>
              <p className="text-2xl font-semibold">{usersData.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
              <FiUser className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search applications..."
              className={`pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "border-gray-300"
              }`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FiX className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          {/* <di className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiFilter />
              <span>Filters</span>
            </button>

            Filter Dropdown
            {showFilters && (
              <div className={`absolute right-0 mt-2 w-56 p-4 rounded-lg shadow-lg z-10 ${
                darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <FiX className="text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      className={`w-full p-2 border rounded ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "border-gray-300"
                      }`}
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedStatus("all");
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Reset all filters
                  </button>
                </div>
              </div>
            )}
          </di> */}
        </div>
      </div>

      {/* Stats Cards */}

      {/* <di className={`p-4 rounded-lg shadow ${
          darkMode ? "bg-gray-800" : "bg-white border border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-semibold">
                {usersData.filter(u => u.status?.toLowerCase() === 'approved').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
              <FiCheckCircle className="w-5 h-5" />
            </div>
          </div>
        </di> */}

      {/* <div className={`p-4 rounded-lg shadow ${
          darkMode ? "bg-gray-800" : "bg-white border border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold">
                {usersData.filter(u => u.status?.toLowerCase() === 'pending').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300">
              <FiClock className="w-5 h-5" />
            </div>
          </div>
        </div> */}

      {/* <div className={`p-4 rounded-lg shadow ${
          darkMode ? "bg-gray-800" : "bg-white border border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-semibold">
                {usersData.filter(u => u.status?.toLowerCase() === 'rejected').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
              <FiXCircle className="w-5 h-5" />
            </div>
          </div>
        </div> */}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                <tr>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold cursor-pointer"
                    onClick={() => requestSort("applicationNumber")}
                  >
                    <div className="flex items-center">
                      App Number
                      {sortConfig.key === "applicationNumber" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold cursor-pointer"
                    onClick={() => requestSort("unitName")}
                  >
                    <div className="flex items-center">
                      Name
                      {sortConfig.key === "unitName" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold cursor-pointer"
                    onClick={() => requestSort("mobile")}
                  >
                    <div className="flex items-center">
                      Phone
                      {sortConfig.key === "mobile" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  {/* <th className="px-6 py-3 text-left text-sm font-semibold">Status</th> */}
                  <th className="px-6 py-3 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  darkMode
                    ? "divide-gray-700 bg-gray-900"
                    : "divide-gray-200 bg-white"
                }`}
              >
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <motion.tr
                      key={user._id}
                      className={`${
                        darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                      } transition-colors`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {user.applicationNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                            {user.unitName?.charAt(0) || "U"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">
                              {user.unitName || "N/A"}
                            </div>
                            <div
                              className={`text-sm ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {user.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{user.mobile || "N/A"}</div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td> */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {/* View button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleView(user)}
                            className={`p-2 rounded-md ${
                              darkMode
                                ? "text-blue-400 hover:bg-gray-700"
                                : "text-blue-600 hover:bg-blue-50"
                            } transition-colors`}
                            title="View"
                          >
                            <FiEye className="w-5 h-5" />
                          </motion.button>

                          {/* Delete button with icon confirmation */}
                          {confirmDeleteId === user._id ? (
                            <div className="flex space-x-1">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(user._id)}
                                disabled={deletingId === user._id}
                                className={`p-2 rounded-md ${
                                  deletingId === user._id
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                } ${
                                  darkMode
                                    ? "text-green-400 hover:bg-gray-700"
                                    : "text-green-600 hover:bg-green-50"
                                } transition-colors`}
                                title="Confirm Delete"
                              >
                                {deletingId === user._id ? (
                                  <FiRefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                  <FiCheckCircle className="w-5 h-5" />
                                )}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setConfirmDeleteId(null)}
                                className={`p-2 rounded-md ${
                                  darkMode
                                    ? "text-red-400 hover:bg-gray-700"
                                    : "text-red-600 hover:bg-red-50"
                                } transition-colors`}
                                title="Cancel"
                              >
                                <FiX className="w-5 h-5" />
                              </motion.button>
                            </div>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setConfirmDeleteId(user._id)}
                              className={`p-2 rounded-md ${
                                darkMode
                                  ? "text-red-400 hover:bg-gray-700"
                                  : "text-red-600 hover:bg-red-50"
                              } transition-colors`}
                              title="Delete"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FiSearch className="w-16 h-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          No applications found
                        </h3>
                        <p
                          className={`mb-4 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Try adjusting your search or filter criteria
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedStatus("all");
                            setCurrentPage(1);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Reset filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div
              className={`flex flex-col md:flex-row items-center justify-between px-6 py-4 ${
                darkMode
                  ? "bg-gray-800 border-t border-gray-700"
                  : "bg-white border-t border-gray-200"
              }`}
            >
              <div className="mb-4 md:mb-0">
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastUser, filteredUsers.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredUsers.length}</span>{" "}
                  applications
                </span>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <label
                    htmlFor="rowsPerPage"
                    className={`mr-2 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Rows per page:
                  </label>
                  <select
                    id="rowsPerPage"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setCurrentPage(1);
                    }}
                    className={`border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {[5, 10, 25, 50].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? "cursor-not-allowed opacity-50"
                        : darkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                    } ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } transition-colors`}
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-md ${
                            currentPage === pageNum
                              ? darkMode
                                ? "bg-blue-600 text-white"
                                : "bg-blue-600 text-white"
                              : darkMode
                              ? "hover:bg-gray-700"
                              : "hover:bg-gray-100"
                          } transition-colors`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="flex items-center px-2">...</span>
                    )}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`w-10 h-10 rounded-md ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors`}
                      >
                        {totalPages}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage >= totalPages}
                    className={`p-2 rounded-md ${
                      currentPage >= totalPages
                        ? "cursor-not-allowed opacity-50"
                        : darkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                    } ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } transition-colors`}
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
