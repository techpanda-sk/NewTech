import React, { useState, useContext, useRef, useCallback } from "react";
import { 
  FiX, FiChevronDown, FiChevronUp, FiPrinter, FiDownload, 
  FiEdit2, FiCopy, FiMapPin, FiPhone, FiMail, FiUser 
} from "react-icons/fi";
import { LayoutContext } from "../../layout/LayoutProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

const View = ({ showMemberDialog, setShowMemberDialog, selectedMember }) => {
  const { darkMode } = useContext(LayoutContext);
  const [expandedSections, setExpandedSections] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  const componentRef = useRef();

  // Move all hooks to the top level - don't conditionally call them
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page { size: auto; margin: 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print-section { break-inside: avoid; }
        * { 
          color: #000 !important; 
          background: transparent !important;
        }
      }
    `,
  });
   
    if (!showMemberDialog) return null;

  // Download as Excel handler
  const handleDownload = () => {
    if (!selectedMember) return;

    // Prepare data for Excel
    const data = [];
    
    // Add header
    data.push([`${selectedMember.unitName || 'Member'} Details`]);
    data.push(['Generated on', new Date().toLocaleString()]);
    data.push([]);

    // Basic Information
    data.push(['Basic Information']);
    data.push(['Application Number', selectedMember.applicationNumber]);
    data.push(['Unit Name', selectedMember.unitName]);
    data.push(['Mobile', selectedMember.mobile]);
    data.push(['Phone', selectedMember.phone]);
    data.push(['Email', selectedMember.email]);
    data.push(['GST Number', selectedMember.gstNumber]);
    data.push(['Udyam Number', selectedMember.udyamNumber]);
    data.push(['Address', selectedMember.address]);
    data.push([]);

    // Entrepreneur Details
    data.push(['Entrepreneur Details']);
    data.push(['Is Women Entrepreneur', selectedMember.isWomenEntrepreneur ? 'Yes' : 'No']);
    data.push(['Capable Entrepreneur', selectedMember.capableEntrepreneur]);
    data.push(['Category', selectedMember.category]);
    data.push(['Registered Enterprise', selectedMember.registeredEnterprise]);
    data.push([]);

    // Proprietors/Directors
    if (selectedMember.proprietors?.length > 0) {
      data.push(['Proprietors/Directors']);
      selectedMember.proprietors.forEach((prop, index) => {
        data.push([`Director ${index + 1} Name`, prop.name]);
        data.push([`Director ${index + 1} Share`, prop.share]);
      });
      data.push([]);
    }

    // Financial Information
    data.push(['Financial Information']);
    data.push(['Filed ITR', selectedMember.filedITR]);
    data.push(['Loan', selectedMember.loan]);
    data.push(['Loan Details', selectedMember.loanDetails]);
    data.push([]);

    // Property Details
    if (selectedMember.property) {
      data.push(['Property Details']);
      data.push(['Land', selectedMember.property.land]);
      data.push(['Building', selectedMember.property.building]);
      data.push(['Plant & Machinery', selectedMember.property.plantMachinery]);
      data.push(['Other Assets', selectedMember.property.otherAssets]);
      data.push([]);
    }

    // Facilities
    if (selectedMember.facilities) {
      data.push(['Facilities']);
      Object.entries(selectedMember.facilities).forEach(([facility, available]) => {
        data.push([facility.replace(/([A-Z])/g, ' $1'), available ? 'Yes' : 'No']);
      });
      data.push([]);
    }

    // Machinery
    if (selectedMember.machinery?.length > 0) {
      data.push(['Machinery']);
      selectedMember.machinery.forEach((machine, index) => {
        data.push([`Machine ${index + 1} Name`, machine.name]);
        data.push([`Machine ${index + 1} Imported`, machine.imported ? 'Yes' : 'No']);
        data.push([`Machine ${index + 1} Value`, machine.value]);
      });
      data.push([]);
    }

    // Products
    if (selectedMember.products?.length > 0) {
      data.push(['Products']);
      selectedMember.products.forEach((product, index) => {
        data.push([`Product ${index + 1} Name`, product.name]);
        data.push([`Product ${index + 1} Capacity`, product.capacity]);
      });
      data.push([]);
    }

    // Employment Details
    data.push(['Employment Details']);
    data.push(['Permanent Male', selectedMember.perm_male || '0']);
    data.push(['Permanent Female', selectedMember.perm_female || '0']);
    data.push(['Permanent SC', selectedMember.perm_sc || '0']);
    data.push(['Permanent ST', selectedMember.perm_st || '0']);
    data.push(['Permanent OBC', selectedMember.perm_obc || '0']);
    data.push(['Permanent Disabled', selectedMember.perm_disabled || '0']);
    data.push(['Temporary Male', selectedMember.temp_male || '0']);
    data.push(['Temporary Female', selectedMember.temp_female || '0']);
    data.push([]);

    // Product Costs
    if (selectedMember.productCosts?.length > 0) {
      data.push(['Product Costs']);
      selectedMember.productCosts.forEach((cost, index) => {
        data.push([`Year ${cost.year} Cost`, cost.cost]);
      });
      data.push([]);
    }

    // Production Capacity
    if (selectedMember.productionCapacity?.length > 0) {
      data.push(['Production Capacity']);
      selectedMember.productionCapacity.forEach((capacity, index) => {
        data.push([`Product ${capacity.product} (${capacity.year})`]);
        data.push(['  Capacity', capacity.capacity]);
        data.push(['  Actual', capacity.actual]);
        data.push(['  Utilization', capacity.utilization]);
      });
      data.push([]);
    }

    // Profit
    if (selectedMember.profit?.length > 0) {
      data.push(['Profit']);
      selectedMember.profit.forEach((profit, index) => {
        data.push([`Profit ${index + 1} Value`, profit.value]);
        data.push([`Profit ${index + 1} Percent`, profit.percent]);
        data.push([`Profit ${index + 1} Remark`, profit.remark]);
      });
      data.push([]);
    }

    // Net Profit
    if (selectedMember.netProfit?.length > 0) {
      data.push(['Net Profit']);
      selectedMember.netProfit.forEach((profit, index) => {
        data.push([`Net Profit ${index + 1} Value`, profit.value]);
        data.push([`Net Profit ${index + 1} Percent`, profit.percent]);
        data.push([`Net Profit ${index + 1} Remark`, profit.remark]);
      });
      data.push([]);
    }

    // Technology
    data.push(['Technology']);
    data.push(['Technology Used', selectedMember.techUsed]);
    data.push(['Technology Description', selectedMember.techDesc]);
    data.push(['Product Development', selectedMember.prodDev]);
    data.push(['Product Development Description', selectedMember.prodDevDesc]);
    data.push([]);

    // Quality
    data.push(['Quality']);
    data.push(['Quality Certification', selectedMember.qualityCert]);
    data.push(['Quality Certification Description', selectedMember.qualityCertDesc]);
    data.push(['Quality Standard', selectedMember.qualityStandard]);
    data.push(['Quality Standard Description', selectedMember.qualityStandardDesc]);
    data.push([]);

    // Export Data
    if (selectedMember.exportData?.length > 0) {
      data.push(['Export Data']);
      selectedMember.exportData.forEach((exportItem, index) => {
        data.push([`Export ${index + 1} Product`, exportItem.product]);
        data.push([`Export ${index + 1} Country`, exportItem.country]);
        data.push([`Export ${index + 1} Year`, exportItem.year]);
        data.push([`Export ${index + 1} Quantity`, exportItem.quantity]);
        data.push([`Export ${index + 1} Percent`, exportItem.percent]);
      });
      data.push([]);
    }

    // Additional Information
    data.push(['Additional Information']);
    data.push(['Hire Setup', selectedMember.hireSetup]);
    data.push(['Hire Setup Description', selectedMember.hireSetupDesc]);
    data.push(['Training', selectedMember.training]);
    data.push(['Training Description', selectedMember.trainingDesc]);
    data.push(['Pension Information', selectedMember.pensionInfo]);
    data.push(['Vendor Development', selectedMember.vendorDev]);
    data.push(['Vendor Development Description', selectedMember.vendorDevDesc]);
    data.push(['Other Information', selectedMember.otherInfo]);
    data.push([]);

    // Pollution
    if (selectedMember.pollution?.length > 0) {
      data.push(['Pollution']);
      selectedMember.pollution.forEach((pollution, index) => {
        data.push([`Pollution ${index + 1} Name`, pollution.name]);
        data.push([`Pollution ${index + 1} Year`, pollution.year]);
        data.push([`Pollution ${index + 1} Cost`, pollution.cost]);
      });
      data.push([]);
    }

    // Verification
    data.push(['Verification']);
    data.push(['Verification Unit Name', selectedMember.verificationUnitName]);
    data.push(['Verification Date', selectedMember.verificationDate ? 
      new Date(selectedMember.verificationDate).toLocaleDateString() : 'N/A']);
    data.push(['Applicant Name', selectedMember.applicantName]);
    data.push(['Designation', selectedMember.designation]);
    data.push([]);

    // Timestamps
    data.push(['Timestamps']);
    data.push(['Created At', new Date(selectedMember.createdAt).toLocaleString()]);
    data.push(['Updated At', new Date(selectedMember.updatedAt).toLocaleString()]);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Member Details");

    // Generate file and download
    const fileName = `${selectedMember.unitName || 'Member'}_Details_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Copy to clipboard
  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper function to render array data with enhanced UI
  const renderArrayData = (array, fields) => {
    if (!array || array.length === 0 || !array[0][fields[0]]) {
      return (
        <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            No data available
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {array.map((item, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
          >
            {fields.map(field => (
              item[field] && (
                <div key={field} className="flex justify-between items-start mb-1 last:mb-0">
                  <span className="font-medium capitalize text-sm">
                    {field.replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm ml-2">
                      {typeof item[field] === 'boolean' ? 
                        (item[field] ? 'Yes' : 'No') : 
                        item[field]}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(item[field], `${field}-${index}`)}
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 no-print"
                      title="Copy"
                    >
                      <FiCopy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            ))}
          </motion.div>
        ))}
      </div>
    );
  };

  // Helper function to render boolean facilities
  const renderFacilities = (facilities) => {
    if (!facilities) return null;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(facilities).map(([key, value]) => (
          <motion.div 
            key={key}
            whileHover={{ scale: 1.02 }}
            className={`flex items-center p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
          >
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
              value ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
          </motion.div>
        ))}
      </div>
    );
  };

  // Section component
  const Section = ({ title, children, defaultExpanded = true }) => {
    const isExpanded = expandedSections[title] !== undefined ? expandedSections[title] : defaultExpanded;
    
    return (
      <div className={`mb-6 print-section ${darkMode ? "border-gray-700" : "border-gray-200"} ${isExpanded ? 'border-b pb-6' : ''}`}>
        <button
          onClick={() => toggleSection(title)}
          className={`flex items-center justify-between w-full text-left mb-3 ${
            darkMode ? "text-white" : "text-gray-800"
          } no-print`}
        >
          <h3 className="text-lg font-semibold">{title}</h3>
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Info item component
  const InfoItem = ({ label, value, copyable = false }) => {
    if (!value) return null;
    
    return (
      <div className="mb-3">
        <h4 className={`text-sm font-medium ${
          darkMode ? "text-gray-300" : "text-gray-500"
        }`}>
          {label}
        </h4>
        <div className="flex items-center mt-1">
          <p className={`text-sm ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
          </p>
          {copyable && (
            <button 
              onClick={() => copyToClipboard(value, label)}
              className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 no-print"
              title="Copy"
            >
              <FiCopy className="w-4 h-4" />
              {copiedField === label && (
                <span className="absolute -mt-8 text-xs bg-gray-800 text-white px-2 py-1 rounded no-print">
                  Copied!
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 w-full h-full bg-opacity-50 flex justify-center items-center z-[1300] ${
        darkMode ? "bg-gray-900" : "bg-black bg-opacity-30"
      }`}
      onClick={() => setShowMemberDialog(false)}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`w-[95%] md:w-[90%] lg:w-[85%] max-w-[1200px] max-h-[90vh] overflow-auto rounded-xl shadow-2xl ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with action buttons */}
        <div className="sticky top-0 z-10 p-4 flex justify-between items-center border-b backdrop-blur-sm bg-opacity-90 no-print"
          style={{
            backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: darkMode ? '#374151' : '#e5e7eb'
          }}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
              <FiUser className="text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {selectedMember?.unitName || 'Member Details'}
              </h2>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Application #: {selectedMember?.applicationNumber || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className={`p-2 rounded-lg flex items-center ${
                darkMode 
                  ? "text-blue-400 hover:bg-gray-700" 
                  : "text-blue-600 hover:bg-blue-50"
              } transition-colors`}
              title="Print"
            >
              <FiPrinter className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className={`p-2 rounded-lg flex items-center ${
                darkMode 
                  ? "text-green-400 hover:bg-gray-700" 
                  : "text-green-600 hover:bg-green-50"
              } transition-colors`}
              title="Export to Excel"
            >
              <FiDownload className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg flex items-center ${
                darkMode 
                  ? "text-yellow-400 hover:bg-gray-700" 
                  : "text-yellow-600 hover:bg-yellow-50"
              } transition-colors`}
              title="Edit"
            >
              <FiEdit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMemberDialog(false)}
              className={`p-2 rounded-lg ${
                darkMode 
                  ? "text-gray-400 hover:bg-gray-700" 
                  : "text-gray-500 hover:bg-gray-100"
              } transition-colors`}
              title="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main content with ref for printing */}
        <div ref={componentRef}>
          {selectedMember && (
            <div className="p-6">
              {/* Quick Info Bar - hidden in print */}
              <div className={`mb-6 p-4 rounded-xl no-print ${
                darkMode ? "bg-gray-700" : "bg-blue-50"
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <FiMapPin className={`mr-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                    <span className="text-sm">{selectedMember.address || 'Address not available'}</span>
                  </div>
                  <div className="flex items-center">
                    <FiPhone className={`mr-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                    <span className="text-sm">
                      {selectedMember.mobile || selectedMember.phone || 'Phone not available'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiMail className={`mr-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                    <span className="text-sm">{selectedMember.email || 'Email not available'}</span>
                  </div>
                </div>
              </div>

              {/* Print header - only visible in print */}
              <div className="hidden print:block print-header">
                <h1 className="text-2xl font-bold text-center mb-2">
                  {selectedMember.unitName || 'Member Details'}
                </h1>
                <div className="flex justify-between border-b pb-2 mb-4">
                  <p>Application #: {selectedMember.applicationNumber || 'N/A'}</p>
                  <p>Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Basic Information */}
              <Section title="Basic Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoItem label="Application Number" value={selectedMember.applicationNumber} copyable />
                  <InfoItem label="Unit Name" value={selectedMember.unitName} copyable />
                  <InfoItem label="Mobile" value={selectedMember.mobile} copyable />
                  <InfoItem label="Phone" value={selectedMember.phone} copyable />
                  <InfoItem label="Email" value={selectedMember.email} copyable />
                  <InfoItem label="GST Number" value={selectedMember.gstNumber} copyable />
                  <InfoItem label="Udyam Number" value={selectedMember.udyamNumber} copyable />
                  <InfoItem label="Address" value={selectedMember.address} />
                </div>
              </Section>

              {/* Entrepreneur Details */}
              <Section title="Entrepreneur Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Is Women Entrepreneur" value={selectedMember.isWomenEntrepreneur} />
                  <InfoItem label="Capable Entrepreneur" value={selectedMember.capableEntrepreneur} />
                  <InfoItem label="Category" value={selectedMember.category} />
                  <InfoItem label="Registered Enterprise" value={selectedMember.registeredEnterprise} />
                </div>
              </Section>

              {/* Proprietors/Directors */}
              <Section title="Proprietors/Directors">
                {selectedMember.proprietors && selectedMember.proprietors.length > 0 ? (
                  <div className="space-y-3">
                    {selectedMember.proprietors.map((prop, index) => (
                      <motion.div 
                        key={index}
                        whileHover={{ scale: 1.01 }}
                        className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                      >
                        <InfoItem label="Name" value={prop.name} copyable />
                        <InfoItem label="Share" value={prop.share} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    No proprietor/director information available
                  </p>
                )}
                {selectedMember.director && (
                  <InfoItem label="Director" value={selectedMember.director} copyable />
                )}
              </Section>

              {/* Financial Information */}
              <Section title="Financial Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Filed ITR" value={selectedMember.filedITR} />
                  <InfoItem label="Loan" value={selectedMember.loan} />
                  <InfoItem label="Loan Details" value={selectedMember.loanDetails} />
                </div>
              </Section>

              {/* Property Details */}
              {selectedMember.property && (
                <Section title="Property Details">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoItem label="Land" value={selectedMember.property.land} />
                    <InfoItem label="Building" value={selectedMember.property.building} />
                    <InfoItem label="Plant & Machinery" value={selectedMember.property.plantMachinery} />
                    <InfoItem label="Other Assets" value={selectedMember.property.otherAssets} />
                  </div>
                </Section>
              )}

              {/* Facilities */}
              <Section title="Facilities">
                {selectedMember.facilities ? (
                  renderFacilities(selectedMember.facilities)
                ) : (
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    No facilities information available
                  </p>
                )}
              </Section>

              {/* Machinery */}
              <Section title="Machinery">
                {renderArrayData(selectedMember.machinery, ['name', 'imported', 'value'])}
              </Section>

              {/* Products */}
              <Section title="Products">
                {renderArrayData(selectedMember.products, ['name', 'capacity'])}
              </Section>

              {/* Employment Details */}
              <Section title="Employment Details">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoItem label="Permanent Male" value={selectedMember.perm_male || '0'} />
                  <InfoItem label="Permanent Female" value={selectedMember.perm_female || '0'} />
                  <InfoItem label="Permanent SC" value={selectedMember.perm_sc || '0'} />
                  <InfoItem label="Permanent ST" value={selectedMember.perm_st || '0'} />
                  <InfoItem label="Permanent OBC" value={selectedMember.perm_obc || '0'} />
                  <InfoItem label="Permanent Disabled" value={selectedMember.perm_disabled || '0'} />
                  <InfoItem label="Temporary Male" value={selectedMember.temp_male || '0'} />
                  <InfoItem label="Temporary Female" value={selectedMember.temp_female || '0'} />
                </div>
              </Section>

              {/* Product Costs */}
              <Section title="Product Costs">
                {renderArrayData(selectedMember.productCosts, ['year', 'cost'])}
              </Section>

              {/* Production Capacity */}
              <Section title="Production Capacity">
                {renderArrayData(selectedMember.productionCapacity, ['product', 'year', 'capacity', 'actual', 'utilization'])}
              </Section>

              {/* Profit */}
              <Section title="Profit">
                {renderArrayData(selectedMember.profit, ['value', 'percent', 'remark'])}
              </Section>

              {/* Net Profit */}
              <Section title="Net Profit">
                {renderArrayData(selectedMember.netProfit, ['value', 'percent', 'remark'])}
              </Section>

              {/* Technology */}
              <Section title="Technology">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Technology Used" value={selectedMember.techUsed} />
                  <InfoItem label="Technology Description" value={selectedMember.techDesc} />
                  <InfoItem label="Product Development" value={selectedMember.prodDev} />
                  <InfoItem label="Product Development Description" value={selectedMember.prodDevDesc} />
                </div>
              </Section>

              {/* Quality */}
              <Section title="Quality">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Quality Certification" value={selectedMember.qualityCert} />
                  <InfoItem label="Quality Certification Description" value={selectedMember.qualityCertDesc} />
                  <InfoItem label="Quality Standard" value={selectedMember.qualityStandard} />
                  <InfoItem label="Quality Standard Description" value={selectedMember.qualityStandardDesc} />
                </div>
              </Section>

              {/* Export Data */}
              <Section title="Export Data">
                {renderArrayData(selectedMember.exportData, ['product', 'country', 'year', 'quantity', 'percent'])}
              </Section>

              {/* Additional Information */}
              <Section title="Additional Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Hire Setup" value={selectedMember.hireSetup} />
                  <InfoItem label="Hire Setup Description" value={selectedMember.hireSetupDesc} />
                  <InfoItem label="Training" value={selectedMember.training} />
                  <InfoItem label="Training Description" value={selectedMember.trainingDesc} />
                  <InfoItem label="Pension Information" value={selectedMember.pensionInfo} />
                  <InfoItem label="Vendor Development" value={selectedMember.vendorDev} />
                  <InfoItem label="Vendor Development Description" value={selectedMember.vendorDevDesc} />
                  <InfoItem label="Other Information" value={selectedMember.otherInfo} />
                </div>
              </Section>

              {/* Pollution */}
              <Section title="Pollution">
                {renderArrayData(selectedMember.pollution, ['name', 'year', 'cost'])}
              </Section>

              {/* Verification */}
              <Section title="Verification">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Verification Unit Name" value={selectedMember.verificationUnitName} />
                  <InfoItem label="Verification Date" value={
                    selectedMember.verificationDate ? 
                    new Date(selectedMember.verificationDate).toLocaleDateString() : 'N/A'
                  } />
                  <InfoItem label="Applicant Name" value={selectedMember.applicantName} />
                  <InfoItem label="Designation" value={selectedMember.designation} />
                </div>
              </Section>

              {/* Signature */}
              {selectedMember.signature && (
                <Section title="Signature">
                  <div className="w-32 h-32 border rounded flex items-center justify-center overflow-hidden">
                    <img 
                      src={selectedMember.signature} 
                      alt="Signature" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </Section>
              )}

              {/* Dates */}
              <Section title="Timestamps">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem 
                    label="Created At" 
                    value={new Date(selectedMember.verificationDate).toLocaleString()} 
                  />
                  {/* <InfoItem 
                    label="Updated At" 
                    value={new Date(selectedMember.updatedAt).toLocaleString()} 
                  /> */}
                </div>
              </Section>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default View;