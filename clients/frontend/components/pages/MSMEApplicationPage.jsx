import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function MSMEAwardApplicationPage() {
  const years = ["(i)", "(ii)", "(iii)"];
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(
    localStorage.getItem("msmeFormSubmitted") === "true" || false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load form data from localStorage if available
  const initialFormData = JSON.parse(localStorage.getItem("msmeFormData")) || {
    // Section 1: Basic Information
    unitName: "",
    isWomenEntrepreneur: "",
    capableEntrepreneur: "",
    category: "",
    businessStructure: "",
    proprietors: [{ name: "", share: "" }],
    director: "",
    registeredEnterprise: "",
    mobile: "",
    address: "",
    phone: "",
    email: "",
    gstNumber: "",
    udyamNumber: "",

    // Section 2: Financial Information
    filedITR: "",
    itrCertificate: null,
    loan: "",
    loanDetails: "",
    property: {
      land: "",
      building: "",
      plantMachinery: "",
      otherAssets: "",
    },

    // Section 3: Machinery & Energy
    machinery: [{ name: "", imported: "", value: "" }],
    energySource: "",

    // Section 4: Production Details
    products: [{ name: "", capacity: "" }],
    perm_male: "",
    perm_female: "",
    perm_sc: "",
    perm_st: "",
    perm_obc: "",
    perm_disabled: "",
    temp_male: "",
    temp_female: "",

    productCosts: [
      { year: "", cost: "" },
      { year: "", cost: "" },
      { year: "", cost: "" },
    ],
    productionCapacity: [
      {
        product: "",
        year: "",
        capacity: "",
        actual: "",
        utilization: "",
      },
    ],

    // Section 5: Financial Performance
    profit: years.map(() => ({ value: "", percent: "", remark: "" })),
    netProfit: years.map(() => ({ value: "", percent: "", remark: "" })),

    // Section 6: Technology & Innovation
    techUsed: "",
    techDesc: "",
    prodDev: "",
    prodDevDesc: "",
    qualityCert: "",
    qualityCertDesc: "",
    qualityStandard: "",
    qualityStandardDesc: "",
    exportData: [
      { product: "", country: "", year: "", quantity: "", percent: "" },
      { product: "", country: "", year: "", quantity: "", percent: "" },
      { product: "", country: "", year: "", quantity: "", percent: "" },
    ],

    // Section 7: Human Resources
    hireSetup: "",
    hireSetupDesc: "",
    training: "",
    trainingDesc: "",
    facilities: {
      toilet: false,
      canteen: false,
      health: false,
      recreation: false,
      library: false,
      transport: false,
    },
    pensionInfo: "",
    pensionDocument: null,
    // Section 8: Environment & Compliance
    pollution: [{ name: "", year: "", cost: "" }],

    // Section 9: Business Development
    vendorDev: "",
    vendorDevDesc: "",

    // Section 10: Additional Information
    otherInfo: "",
    // Section 11: Verification
    verificationUnitName: "",
    verificationDate: new Date().toISOString().split("T")[0],
    applicantName: "",
    designation: "",
    signature: null,
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    // Clear signature URL if exists
    if (formData.signature && formData.signature instanceof File) {
      URL.revokeObjectURL(URL.createObjectURL(formData.signature));
    }
  }, [formData.signature]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (!isSubmitted) {
      localStorage.setItem("msmeFormData", JSON.stringify(formData));
    }
  }, [formData, isSubmitted]);

  // Prevent auto-submission on page 11 refresh
  useEffect(() => {
    if (currentPage === 11 && !isSubmitted) {
      localStorage.removeItem("msmeFormSubmitted");
    }
  }, [currentPage, isSubmitted]);

  // Warn user before leaving page 11
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentPage === 11 && !isSubmitted) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave? Your form data will be saved but not submitted.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentPage, isSubmitted]);

  // Form validation
  const validateForm = (page) => {
    const newErrors = {};

    if (page === 1) {
      if (!formData.unitName.trim())
        newErrors.unitName = "इकाई का नाम आवश्यक है";

      if (!formData.mobile.trim()) newErrors.mobile = "मोबाइल नंबर आवश्यक है";
      else if (!/^[6-9]\d{9}$/.test(formData.mobile))
        newErrors.mobile = "कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें";

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "मान्य ईमेल दर्ज करें";
    }
    if (page === 2) {
      if (!formData.udyamNumber.trim())
        newErrors.udyamNumber = "उद्यम पंजीयन संख्या आवश्यक है";
    }
    if (page === 11) {
      if (!formData.signature) {
        newErrors.signature = "कृपया हस्ताक्षर अपलोड करें";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile" || name === "phone") {
      const onlyNums = value.replace(/\D/g, "");
      if (onlyNums.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: onlyNums }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const temp_total = () => {
    const male = parseInt(formData.temp_male) || 0;
    const female = parseInt(formData.temp_female) || 0;
    return male + female;
  };

  const perm_total = () => {
    const male = parseInt(formData.perm_male) || 0;
    const female = parseInt(formData.perm_female) || 0;
    return male + female;
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData((prev) => {
      const updatedArray = [...prev[arrayName]];
      updatedArray[index] = {
        ...updatedArray[index],
        [field]: value,
      };
      return {
        ...prev,
        [arrayName]: updatedArray,
      };
    });
  };

  const addArrayItem = (arrayName, template) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], template],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const toggleFacility = (facility) => {
    setFormData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [facility]: !prev.facilities[facility],
      },
    }));
  };

  const handleExportChange = (index, field, value) => {
    const updatedExportData = [...formData.exportData];
    updatedExportData[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      exportData: updatedExportData,
    }));
  };

  const handleFileChange = (fieldName) => (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: e.target.files[0],
      }));
    }
  };

  const handleProductCostChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedCosts = [...prev.productCosts];
      updatedCosts[index] = {
        ...updatedCosts[index],
        [field]: value,
      };
      return {
        ...prev,
        productCosts: updatedCosts,
      };
    });
  };

  const handleSubmit = async (e) => {
    // Only submit if this was a real button click
    if (e) e.preventDefault();
    
    // Don't submit if already submitted or if this is a page reload
    if (isSubmitted || isSubmitting) return;

    if (!validateForm(currentPage)) return;

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    
    // Append files separately
    ["itrCertificate", "pensionDocument", "signature"].forEach((key) => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Remove file fields from data to send as JSON
    const dataToSend = { ...formData };
    delete dataToSend.itrCertificate;
    delete dataToSend.pensionDocument;
    delete dataToSend.signature;

    // Send all other fields as a single JSON string
    formDataToSend.append("formData", JSON.stringify(dataToSend));

    try {
      const response = await axios.post(
        // `http://msme.drunkcafe.in/api/applications`,
         `https://app-ql6v.onrender.com/api/applications`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log("Submission successful:", response.data);
      toast.success("आवेदन सफलतापूर्वक जमा हो गया!");
      
      // Update state and localStorage
      localStorage.setItem("msmeFormSubmitted", "true");
      localStorage.setItem("applicationNumber", response.data.applicationNumber);
      localStorage.removeItem("msmeFormData");
      
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("आवेदन जमा करने में त्रुटि हुई");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startNewApplication = () => {
    localStorage.removeItem("msmeFormData");
    localStorage.removeItem("msmeFormSubmitted");
    localStorage.removeItem("applicationNumber");
    setFormData(initialFormData);
    setIsSubmitted(false);
    setCurrentPage(1);
  };

  // Progress bar calculation
  const progressPercentage = (currentPage / 11) * 100;

  // Indian government form styling
  const govtFormStyle = {
    header: "bg-blue-800 text-white py-4 px-6 rounded-t-lg",
    sectionTitle:
      "text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-2 mb-4",
    inputField:
      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
    selectField:
      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
    errorMessage: "text-red-600 text-sm mt-1",
    requiredStar: "text-red-500",
    buttonPrimary:
      "px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors",
    buttonSecondary:
      "px-6 py-2 bg-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors",
    sectionContainer: "mb-8 p-6 border rounded-lg bg-gray-50 shadow-sm",
    tableHeader: "bg-blue-100 text-blue-800 font-semibold",
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-8 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-green-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-4">
            आवेदन सफलतापूर्वक जमा हो गया!
          </h2>
          <p className="mb-4">
            आपके आवेदन को सफलतापूर्वक प्राप्त कर लिया गया है। आवेदन संख्या:
            {localStorage.getItem("applicationNumber")}. कृपया इसे भविष्य में
            संदर्भ के लिए सहेजें।
          </p>
          <button
            onClick={startNewApplication}
            className={govtFormStyle.buttonPrimary}
          >
            नया आवेदन शुरू करें
          </button>
        </div>
      </div>
    );
  }

  // Pagination functions
  const nextPage = () => {
    if (validateForm(currentPage)) {
      setCurrentPage((prev) => Math.min(prev + 1, 11));
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Progress bar */}
      <div className="mb-6 bg-gray-200 rounded-full h-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="text-center mb-6 text-gray-600">
        पृष्ठ {currentPage} / 11 - {Math.round((currentPage / 11) * 100)}% पूर्ण
      </div>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="bg-white shadow-lg rounded-lg overflow-hidden"
      >
        {/* Form Header */}
        <div className={govtFormStyle.header}>
          <div className="flex items-center justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png"
              alt="Indian Flag"
              className="h-12 mr-4"
            />
            <div>
              <h2 className="text-2xl font-bold">मध्य प्रदेश सरकार</h2>
              <h3 className="text-xl">सूक्ष्म, लघु एवं मध्यम उद्यम विभाग</h3>
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mt-4">
            म.प्र. एमएसएमई राज्य स्तरीय पुरस्कार योजना आवेदन
          </h2>
        </div>

        <div className="p-6">
          {/* Page 1: Basic Information */}
          {currentPage === 1 && (
            <div className={govtFormStyle.sectionContainer}>
              <h3 className={govtFormStyle.sectionTitle}>1. मूल जानकारी</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    इकाई का नाम{" "}
                    <span className={govtFormStyle.requiredStar}>*</span>
                  </label>
                  <input
                    type="text"
                    name="unitName"
                    value={formData.unitName}
                    onChange={handleChange}
                    className={`${govtFormStyle.inputField} ${
                      errors.unitName ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {errors.unitName && (
                    <p className={govtFormStyle.errorMessage}>
                      {errors.unitName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    क्या यह इकाई महिला उद्यमिता द्वारा स्थापित एवं संचालित है
                    (यदि 51% या अधिक हिस्सेदारी महिला की हो)
                  </label>
                  <select
                    name="isWomenEntrepreneur"
                    value={formData.isWomenEntrepreneur}
                    onChange={handleChange}
                    className={govtFormStyle.selectField}
                  >
                    <option value="">चयन करें</option>
                    <option value="हाँ">हाँ</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    क्या इकाई अन्य प्रकार से सक्षम उद्यमी द्वारा स्थापित एवं
                    संचालित है (51% या अधिक साझेदारी होने पर)
                  </label>
                  <select
                    name="capableEntrepreneur"
                    value={formData.capableEntrepreneur}
                    onChange={handleChange}
                    className={govtFormStyle.selectField}
                  >
                    <option value="">चयन करें</option>
                    <option value="हाँ">हाँ</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    इकाई की श्रेणी (51% या अधिक साझेदारी होने पर)
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={govtFormStyle.selectField}
                  >
                    <option value="">चयन करें</option>
                    <option value="सामान्य">सामान्य</option>
                    <option value="अजा">अजा</option>
                    <option value="अजजा">अजजा</option>
                  </select>
                </div>
              </div>

              {/* Proprietors Section */}
              <div className="mb-6">
                <div className="mb-2">
                  {/* <h4 className="text-sm font-medium mb-3"> इकाई का प्रकार : प्रोपराइटर / संस्था / पार्टनरशिप / कंपनी / अन्य</h4> */}
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    इकाई का प्रकार
                  </label>
                  <select
                    name="businessStructure"
                    value={formData.businessStructure}
                    onChange={handleChange}
                    className="w-25/51 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">चयन करें</option>
                    <option value="प्रोपराइटर">प्रोपराइटर</option>
                    <option value="संस्था">संस्था</option>
                    <option value="पार्टनरशिप">पार्टनरशिप</option>
                    <option value=" कंपनी "> कंपनी </option>
                    <option value="अन्य"> अन्य </option>
                  </select>
                </div>
                {formData.proprietors.map((proprietor, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded shadow-sm mb-3 border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          प्रोप्राइटर / पार्टनर का नाम
                        </label>
                        <input
                          type="text"
                          value={proprietor.name}
                          onChange={(e) =>
                            handleArrayChange(
                              "proprietors",
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          className={govtFormStyle.inputField}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          हिस्सेदारी का प्रतिशत(%)
                        </label>
                        <input
                          type="number"
                          value={proprietor.share}
                          onChange={(e) => {
                            // Validate the input value
                            const value = e.target.value;
                            if (
                              value === "" ||
                              (Number(value) >= 0 && Number(value) <= 100)
                            ) {
                              handleArrayChange(
                                "proprietors",
                                index,
                                "share",
                                value === ""
                                  ? ""
                                  : Math.min(100, Math.max(0, Number(value))) // Ensure value stays between 0-100
                              );
                            }
                          }}
                          min="0"
                          max="100"
                          step="1" // Allows decimal percentages if needed
                          className={govtFormStyle.inputField}
                          onKeyDown={(e) => {
                            // Prevent entering negative numbers with minus key
                            if (e.key === "-" || e.key === "e") {
                              e.preventDefault();
                            }
                          }}
                        />
                      </div>
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("proprietors", index)}
                        className="mt-2 text-red-600 text-sm hover:text-red-800 flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        हटाएँ
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("proprietors", { name: "", share: "" })
                  }
                  className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  नया प्रोपराइटर जोड़ें
                </button>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    इकाई स्वामि/भागीदार/संचालक/मुखत्यार का नाम एवं पद
                  </label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={handleChange}
                    className={govtFormStyle.inputField}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    मोबाईल नम्बर{" "}
                    <span className={govtFormStyle.requiredStar}>*</span>
                  </label>
                  <input
                    inputMode="numeric"
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength="10"
                    pattern="[0-9]{10}"
                    className={`${govtFormStyle.inputField} ${
                      errors.mobile ? "border-red-500" : ""
                    }`}
                  />
                  {errors.mobile && (
                    <p className={govtFormStyle.errorMessage}>
                      {errors.mobile}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    विनिर्माण उद्यम का प्रकार
                  </label>
                  <select
                    name="registeredEnterprise"
                    value={formData.registeredEnterprise}
                    onChange={handleChange}
                    className={govtFormStyle.selectField}
                  >
                    <option value="">चयन करें</option>
                    <option value="सूक्ष्म">सूक्ष्म</option>
                    <option value="लघु">लघु</option>
                    <option value="मध्यम">मध्यम</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    टेलीफोन नंबर
                  </label>
                  <input
                    inputMode="numeric"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={govtFormStyle.inputField}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    ई-मेल
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${govtFormStyle.inputField} ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className={govtFormStyle.errorMessage}>{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    जीएसटी क्रमांक
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className={govtFormStyle.inputField}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  इकाई पता
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={govtFormStyle.inputField}
                ></textarea>
              </div>
            </div>
          )}

          {/* Page 2: Financial Information */}
          {currentPage === 2 && (
            <div className={govtFormStyle.sectionContainer}>
              <h3 className={govtFormStyle.sectionTitle}>2. वित्तीय जानकारी</h3>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  2. वैध ईवीएम भाग-2 / यूएएम / स्थायी पंजीयन क्रमांक / उधम
                  रजिस्ट्रेशन क्रमांक एवं तिथि
                  <span className={govtFormStyle.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  name="udyamNumber"
                  value={formData.udyamNumber}
                  onChange={handleChange}
                  className={`${govtFormStyle.inputField} ${
                    errors.udyamNumber ? "border-red-500" : ""
                  }`}
                />
                {errors.udyamNumber && (
                  <p className={govtFormStyle.errorMessage}>
                    {errors.udyamNumber}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  3. क्या विगत तीन वर्षों में आयकर रिटर्न जमा किया गया है? (यदि
                  हाँ, तो छायाप्रति संलग्न करें।)
                </label>
                <select
                  name="filedITR"
                  value={formData.filedITR}
                  onChange={handleChange}
                  className={govtFormStyle.selectField}
                >
                  <option value="">चयन करें</option>
                  <option value="हाँ">हाँ</option>
                  <option value="नहीं">नहीं</option>
                </select>
              </div>

              {currentPage === 2 && formData.filedITR === "हाँ" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    आयकर रिटर्न प्रमाण पत्र (PDF/JPG/PNG)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange("itrCertificate")}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-1 block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
                  />
                  {formData.itrCertificate && (
                    <p className="mt-1 text-sm text-green-600">
                      Selected: {formData.itrCertificate.name}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    4. क्या इकाई स्थापना/विस्तार हेतु किसी वित्तीय संस्था से ऋण
                    लिया गया है? (यदि हाँ, तो विवरण दें एवं ऋण प्रदायक की
                    जानकारी भी दें।)
                  </label>
                  <select
                    name="loan"
                    value={formData.loan}
                    onChange={handleChange}
                    className={govtFormStyle.selectField}
                  >
                    <option value="">चयन करें</option>
                    <option value="हाँ">हाँ</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                {formData.loan === "हाँ" && (
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      विवरण एवं अनुदान / ऋण राशि
                    </label>
                    <textarea
                      name="loanDetails"
                      value={formData.loanDetails}
                      onChange={handleChange}
                      rows="2"
                      className={govtFormStyle.inputField}
                    ></textarea>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">
                  5. स्थायी संपत्ति का विवरण (₹ में)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "भू‑भूमि", field: "land" },
                    { label: "भवन", field: "building" },
                    { label: "प्लांट एवं मशीनरी", field: "plantMachinery" },
                    { label: "अन्य परिसंपत्ति", field: "otherAssets" },
                  ].map((item, i) => (
                    <div key={i}>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        {item.label}
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md text-gray-700">
                          ₹
                        </span>
                        <input
                          type="number"
                          placeholder="राशि"
                          value={formData.property[item.field]}
                          onChange={(e) =>
                            handleNestedChange(
                              "property",
                              item.field,
                              // Ensure value is not negative
                              Math.max(
                                0,
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                              )
                            )
                          }
                          min="0"
                          onKeyDown={(e) => {
                            // Prevent minus sign, 'e' (exponent), and 'E'
                            if (["-", "e", "E"].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Property Value */}
                <div className="mt-4 text-right font-semibold text-gray-800">
                  कुल राशि: ₹{" "}
                  {(
                    Number(formData.property.land || 0) +
                    Number(formData.property.building || 0) +
                    Number(formData.property.plantMachinery || 0) +
                    Number(formData.property.otherAssets || 0)
                  ).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          )}

          {/* Page 3: Machinery & Energy */}
          {currentPage === 3 && (
            <div className={govtFormStyle.sectionContainer}>
              <h3 className={govtFormStyle.sectionTitle}>
                3. मशीनरी एवं ऊर्जा
              </h3>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">
                  6. संयंत्र एवं मशीनरी
                </h4>
                {formData.machinery.map((machine, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded shadow-sm mb-3 border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          स्थापित संयंत्र एवं मशीनरी का नाम
                        </label>
                        <input
                          value={machine.name}
                          onChange={(e) =>
                            handleArrayChange(
                              "machinery",
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          className={govtFormStyle.inputField}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          आयातित / स्वदेशी
                        </label>
                        {/* <input
                          value={machine.imported}
                          onChange={(e) =>
                            handleArrayChange(
                              "machinery",
                              index,
                              "imported",
                              e.target.value
                            )
                          }
                          className={govtFormStyle.inputField}
                        /> */}
                        <select
                          name=" imported"
                          value={machine.imported}
                          onChange={(e) =>
                            handleArrayChange(
                              "machinery",
                              index,
                              "imported",
                              e.target.value
                            )
                          }
                          className={govtFormStyle.selectField}
                        >
                          <option value="">चयन करें</option>
                          <option value="स्वदेशी">स्वदेशी</option>
                          <option value="आयातित">आयातित</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          ₹ मूल्य
                        </label>
                        <input
                          type="number"
                          value={machine.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only update if value is empty or a positive number
                            if (
                              value === "" ||
                              (!isNaN(value) && Number(value) >= 0)
                            ) {
                              handleArrayChange(
                                "machinery",
                                index,
                                "value",
                                value === "" ? "" : Math.abs(Number(value)) // Ensure positive number
                              );
                            }
                          }}
                          min="0"
                          step="any" // Allows decimals if needed (use step="1" for whole numbers only)
                          onKeyDown={(e) => {
                            // Prevent minus sign, 'e' (exponent), and 'E'
                            if (["-", "e", "E"].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          className={govtFormStyle.inputField}
                          onBlur={(e) => {
                            // Format the value when leaving the field
                            if (
                              e.target.value !== "" &&
                              !isNaN(e.target.value)
                            ) {
                              handleArrayChange(
                                "machinery",
                                index,
                                "value",
                                Number(e.target.value).toFixed(2) // Format to 2 decimal places
                              );
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-end">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem("machinery", index)}
                            className="text-red-600 text-sm hover:text-red-800 flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            हटाएँ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("machinery", {
                      name: "",
                      imported: "",
                      value: "",
                    })
                  }
                  className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  नई मशीनरी जोड़ें
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">
                  7. ऊर्जा का स्रोत एवं वार्षिक खर्च
                </h4>
                <input
                  type="text"
                  placeholder=" ऊर्जा का स्रोत एवं वार्षिक खर्च विवरण डालें"
                  name="energySource"
                  value={formData.energySource}
                  onChange={handleChange}
                  className={govtFormStyle.inputField}
                />
              </div>
            </div>
          )}

          {/* Page 4: Production Details */}
          {currentPage === 4 && (
            <div className={govtFormStyle.sectionContainer}>
              <h3 className={govtFormStyle.sectionTitle}>4. उत्पादन विवरण</h3>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">8. उत्पाद का विवरण</h4>
                {formData.products.map((product, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded shadow-sm mb-3 border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          उत्पाद का नाम
                        </label>
                        <input
                          value={product.name}
                          onChange={(e) =>
                            handleArrayChange(
                              "products",
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          className={govtFormStyle.inputField}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          वार्षिक उत्पादन क्षमता
                        </label>
                        <input
                          value={product.capacity}
                          onChange={(e) =>
                            handleArrayChange(
                              "products",
                              index,
                              "capacity",
                              e.target.value
                            )
                          }
                          className={govtFormStyle.inputField}
                        />
                      </div>
                      <div className="flex items-end">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem("products", index)}
                            className="text-red-600 text-sm hover:text-red-800 flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            हटाएँ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("products", { name: "", capacity: "" })
                  }
                  className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  उत्पाद जोड़ें
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">9. प्रदत्त रोजगार</h4>
                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <table className="w-full border-collapse border border-gray-300 text-center shadow-md">
                    <thead>
                      <tr className={govtFormStyle.tableHeader}>
                        <th className="border border-gray-300 p-2 w-1/12">
                          क्र.
                        </th>
                        <th className="border border-gray-300 p-2 w-7/12">
                          विवरण
                        </th>
                        <th className="border border-gray-300 p-2 w-4/12">
                          संख्या
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Permanent Employees Section */}
                      <tr>
                        <td
                          rowSpan="8"
                          className="border border-gray-300 p-2 align-top"
                        >
                          (अ)
                        </td>
                        <td
                          colSpan="2"
                          className="border border-gray-300 p-2 text-left font-bold bg-gray-50"
                        >
                          स्थायी कर्मचारी
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          (i) पुरुष
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            name="perm_male"
                            value={formData.perm_male}
                            onChange={handleChange}
                            className="px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            min="0"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          (ii) महिला
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            name="perm_female"
                            value={formData.perm_female}
                            onChange={handleChange}
                            className=" px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            min="0"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 text-left font-bold">
                          योग
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            name="perm_total"
                            value={perm_total()}
                            readOnly
                            className="px-2 py-1 border border-gray-300 rounded text-center bg-gray-100 font-medium"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          (iii) अनुसूचित जाति (अजा)
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            name="perm_sc"
                            value={formData.perm_sc}
                            onChange={handleChange}
                            className="px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            min="0"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          (iv) अनुसूचित जनजाति (अजजा)
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            name="perm_st"
                            value={formData.perm_st}
                            onChange={handleChange}
                            className="px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            min="0"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          (v) अन्य पिछड़ा वर्ग (OBC)
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            name="perm_obc"
                            value={formData.perm_obc}
                            onChange={handleChange}
                            className="px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            min="0"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          (vi) अन्य प्रकार से सक्षम
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            name="perm_disabled"
                            value={formData.perm_disabled}
                            onChange={handleChange}
                            className="px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            min="0"
                          />
                        </td>
                      </tr>

                      {/* Temporary Employees Section */}
                      <tr>
                        <td
                          rowSpan="4"
                          className="border border-gray-300 p-2 align-top"
                        >
                          (ब)
                        </td>
                        <td
                          colSpan="2"
                          className="border border-gray-300 p-2 text-left font-bold bg-gray-50"
                        >
                          अस्थायी कर्मचारी
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          (i) पुरुष
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            name="temp_male"
                            value={formData.temp_male}
                            onChange={handleChange}
                            className="px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            min="0"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          (ii) महिला
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            name="temp_female"
                            value={formData.temp_female}
                            onChange={handleChange}
                            className="px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            min="0"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 text-left font-bold">
                          योग
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            name="temp_total"
                            value={temp_total()}
                            readOnly
                            className="px-2 py-1 border border-gray-300 rounded text-center bg-gray-100 font-medium"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Page 5: Production Details Continued */}
          {currentPage === 5 && (
            <div className={govtFormStyle.sectionContainer}>
              <h3 className={govtFormStyle.sectionTitle}>
                4. उत्पादन विवरण (जारी)
              </h3>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">
                  10. विगत तीन वर्षों में वार्षिक उत्पादन लागत
                </h4>
                <div className="bg-white p-4 rounded shadow-sm mb-3 border border-gray-200">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className={govtFormStyle.tableHeader}>
                        <th className="p-2 border border-gray-300">क्र.</th>
                        <th className="p-2 border border-gray-300">वर्ष</th>
                        <th className="p-2 border border-gray-300">
                          वार्षिक उत्पादन लागत (रु.)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.productCosts.map((item, index) => (
                        <tr key={index}>
                          <td className="p-2 border border-gray-300 text-center">
                            {index + 1}
                          </td>
                          <td className="p-2 border border-gray-300">
                            <select
                              name="year"
                              value={item.year}
                              onChange={(e) =>
                                handleProductCostChange(
                                  index,
                                  "year",
                                  e.target.value
                                )
                              }
                              className={`${govtFormStyle.inputField} bg-gray-100 w-full`}
                            >
                              <option value="">Select Year</option>
                              {Array.from(
                                { length: new Date().getFullYear() - 2000 + 1 },
                                (_, i) => 2000 + i
                              )
                                .reverse() // Shows most recent years first
                                .map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td className="p-2 border border-gray-300">
                            <input
                              type="number"
                              name="cost"
                              value={item.cost}
                              onChange={(e) =>
                                handleProductCostChange(
                                  index,
                                  "cost",
                                  e.target.value
                                )
                              }
                              className={govtFormStyle.inputField}
                              placeholder="लागत रकम दर्ज करें"
                              min="0"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">
                  11. विगत तीन वर्षों में स्थापित क्षमता और उसमें किया गया
                  उत्पादन
                </h4>
                {formData.productionCapacity.map((pc, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded shadow-sm mb-3 border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          उत्पाद का नाम
                        </label>
                        <input
                          value={pc.product}
                          onChange={(e) =>
                            handleArrayChange(
                              "productionCapacity",
                              index,
                              "product",
                              e.target.value
                            )
                          }
                          className={govtFormStyle.inputField}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          वर्ष
                        </label>
                        <select
                          value={pc.year}
                          onChange={(e) =>
                            handleArrayChange(
                              "productionCapacity",
                              index,
                              "year",
                              e.target.value
                            )
                          }
                          className={govtFormStyle.inputField}
                        >
                          <option value="">Select Year</option>
                          {Array.from(
                            { length: new Date().getFullYear() - 1999 }, // 2000-current year
                            (_, i) => new Date().getFullYear() - i // Most recent first
                          ).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          उत्पादन क्षमता
                        </label>
                        <input
                          value={pc.capacity}
                          onChange={(e) =>
                            handleArrayChange(
                              "productionCapacity",
                              index,
                              "capacity",
                              e.target.value
                            )
                          }
                          className={govtFormStyle.inputField}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          वास्तविक उत्पादन
                        </label>
                        <input
                          value={pc.actual}
                          onChange={(e) =>
                            handleArrayChange(
                              "productionCapacity",
                              index,
                              "actual",
                              e.target.value
                            )
                          }
                          className={govtFormStyle.inputField}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          प्रतिशत
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1" // Use "0.1" if you want to allow decimals like 50.5%
                          value={pc.utilization}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow empty string or numbers between 0-100
                            if (
                              value === "" ||
                              (!isNaN(value) &&
                                Number(value) >= 0 &&
                                Number(value) <= 100)
                            ) {
                              handleArrayChange(
                                "productionCapacity",
                                index,
                                "utilization",
                                value === ""
                                  ? ""
                                  : Math.min(100, Math.max(0, Number(value)))
                              );
                            }
                          }}
                          className={govtFormStyle.inputField}
                          onKeyDown={(e) => {
                            // Prevent entering negative numbers with minus key
                            if (e.key === "-" || e.key === "e") {
                              e.preventDefault();
                            }
                          }}
                          placeholder="प्रतिशत"
                        />
                      </div>
                      <div className="flex items-end">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem("productionCapacity", index)
                            }
                            className="text-red-600 text-sm hover:text-red-800 flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            हटाएँ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("productionCapacity", {
                      product: "",
                      year: "",
                      capacity: "",
                      actual: "",
                      utilization: "",
                    })
                  }
                  className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  लाइन जोड़ें
                </button>
              </div>
            </div>
          )}

          {/* Page 6: Financial Performance */}
          {currentPage === 6 && (
            <div className={govtFormStyle.sectionContainer}>
              <h3 className={govtFormStyle.sectionTitle}>
                5. वित्तीय प्रदर्शन
              </h3>

              {[
                {
                  title:
                    "12. विगत तीन वर्षों में बिक्री, लाभ एवं लाभ का प्रतिशत",
                  data: formData.profit,
                  name: "profit",
                  valueLabel: "लाभ",
                },
                {
                  title: "13. विगत तीन वर्षों में शुद्ध लाभ एवं लाभ का प्रतिशत",
                  data: formData.netProfit,
                  name: "netProfit",
                  valueLabel: "शुद्ध लाभ",
                },
              ].map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-8 last:mb-0">
                  <h4 className="text-lg font-semibold mb-3 text-gray-700 bg-gray-50 p-3 rounded-md">
                    {section.title}
                  </h4>

                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            क्र.
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            वर्ष
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            {section.valueLabel} (₹)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            {section.valueLabel} (%)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            रिमार्क
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {section.data.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <select
                                value={item.year}
                                onChange={(e) => {
                                  const newData = [...section.data];
                                  newData[index] = {
                                    ...newData[index],
                                    year: e.target.value,
                                  };
                                  setFormData((prev) => ({
                                    ...prev,
                                    [section.name]: newData,
                                  }));
                                }}
                                className={govtFormStyle.inputField}
                              >
                                <option value="">Select Year</option>
                                {Array.from(
                                  { length: new Date().getFullYear() - 1999 }, // 2000 to current year
                                  (_, i) => new Date().getFullYear() - i // Most recent years first
                                ).map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                value={item.value}
                                onChange={(e) => {
                                  const newData = [...section.data];
                                  newData[index] = {
                                    ...newData[index],
                                    value: e.target.value,
                                  };
                                  setFormData((prev) => ({
                                    ...prev,
                                    [section.name]: newData,
                                  }));
                                }}
                                className={govtFormStyle.inputField}
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1" // Use "0.1" to allow decimals (e.g., 50.5%)
                                value={item.percent}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Only update if empty or valid percentage (0-100)
                                  if (
                                    value === "" ||
                                    (Number(value) >= 0 && Number(value) <= 100)
                                  ) {
                                    const newData = [...section.data];
                                    newData[index] = {
                                      ...newData[index],
                                      percent:
                                        value === ""
                                          ? ""
                                          : Math.min(
                                              100,
                                              Math.max(0, Number(value))
                                            ),
                                    };
                                    setFormData((prev) => ({
                                      ...prev,
                                      [section.name]: newData,
                                    }));
                                  }
                                }}
                                className={govtFormStyle.inputField}
                                onKeyDown={(e) => {
                                  // Prevent entering negative numbers with minus key
                                  if (e.key === "-" || e.key === "e") {
                                    e.preventDefault();
                                  }
                                }}
                                placeholder="%"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                value={item.remark || ""}
                                onChange={(e) => {
                                  const newData = [...section.data];
                                  newData[index] = {
                                    ...newData[index],
                                    remark: e.target.value, // Fixed: Changed from percent to remark
                                  };
                                  setFormData((prev) => ({
                                    ...prev,
                                    [section.name]: newData,
                                  }));
                                }}
                                className={govtFormStyle.inputField}
                                placeholder="टिप्पणी"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Page 7: Technology & Innovation */}
          {currentPage === 7 && (
            <div className={govtFormStyle.sectionContainer}>
              <h3 className={govtFormStyle.sectionTitle}>
                6. प्रौद्योगिकी एवं नवाचार
              </h3>

              <div className="mb-6">
                {/* <h4 className="text-lg font-medium mb-3">
                 क्या उत्पाद में नवीनतम तकनीक का उपयोग किया गया है?
                </h4> */}
                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      14. (i) क्या उत्पाद में नवीनतम तकनीक का उपयोग किया गया है?
                      (यदि हाँ, तो विवरण दें)
                    </label>
                    <select
                      value={formData.techUsed}
                      onChange={(e) =>
                        handleChange({
                          target: { name: "techUsed", value: e.target.value },
                        })
                      }
                      className={govtFormStyle.selectField}
                    >
                      <option value="">चयन करें</option>
                      <option>हाँ</option>
                      <option>नहीं</option>
                    </select>
                  </div>
                  {formData.techUsed === "हाँ" && (
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        विवरण
                      </label>
                      <textarea
                        value={formData.techDesc}
                        onChange={(e) =>
                          handleChange({
                            target: { name: "techDesc", value: e.target.value },
                          })
                        }
                        rows="3"
                        className={govtFormStyle.inputField}
                      ></textarea>
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      (ii) क्या उत्पाद विकास की क्षमता है? (यदि हाँ, तो विवरण
                      दें)
                    </label>
                    <select
                      value={formData.prodDev}
                      onChange={(e) =>
                        handleChange({
                          target: { name: "prodDev", value: e.target.value },
                        })
                      }
                      className={govtFormStyle.selectField}
                    >
                      <option value="">चयन करें</option>
                      <option>हाँ</option>
                      <option>नहीं</option>
                    </select>
                  </div>
                  {formData.prodDev === "हाँ" && (
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        विवरण
                      </label>
                      <textarea
                        value={formData.prodDevDesc}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: "prodDevDesc",
                              value: e.target.value,
                            },
                          })
                        }
                        rows="3"
                        className={govtFormStyle.inputField}
                      ></textarea>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">
                  15. विगत तीन वर्षों में निर्यात की जानकारी
                </h4>
                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            क्र.
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            उत्पाद का नाम
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            देश
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            वर्ष
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            निर्यात की मात्रा
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            प्रतिशत (कुल उत्पादन से)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.exportData.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                              {index + 1}
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                value={item.product}
                                onChange={(e) =>
                                  handleExportChange(
                                    index,
                                    "product",
                                    e.target.value
                                  )
                                }
                                className={govtFormStyle.inputField}
                                placeholder="उत्पाद नाम"
                              />
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                value={item.country}
                                onChange={(e) =>
                                  handleExportChange(
                                    index,
                                    "country",
                                    e.target.value
                                  )
                                }
                                className={govtFormStyle.inputField}
                                placeholder="देश का नाम"
                              />
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <select
                                value={item.year}
                                onChange={(e) =>
                                  handleExportChange(
                                    index,
                                    "year",
                                    e.target.value
                                  )
                                }
                                className={govtFormStyle.inputField}
                              >
                                <option value="">वर्ष चुनें</option>
                                {Array.from(
                                  { length: new Date().getFullYear() - 1999 }, // 2000 to current year
                                  (_, i) => new Date().getFullYear() - i // Recent years first
                                ).map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleExportChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                className={govtFormStyle.inputField}
                                placeholder="मात्रा"
                              />
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={item.percent}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Only allow empty string or valid percentages (0-100)
                                  if (
                                    value === "" ||
                                    (Number(value) >= 0 && Number(value) <= 100)
                                  ) {
                                    handleExportChange(
                                      index,
                                      "percent",
                                      value === ""
                                        ? ""
                                        : Math.min(
                                            100,
                                            Math.max(0, Number(value))
                                          )
                                    );
                                  }
                                }}
                                className={govtFormStyle.inputField}
                                placeholder="%"
                                onKeyDown={(e) => {
                                  // Prevent entering negative numbers with minus key
                                  if (e.key === "-" || e.key === "e") {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page 8: Technology & Innovation Continued */}
          {currentPage === 8 && (
            <div className={govtFormStyle.sectionContainer}>
              <h3 className={govtFormStyle.sectionTitle}>
                6. प्रौद्योगिकी एवं नवाचार (जारी)
              </h3>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">
                  16. गुणवत्ता प्रमाणन का विवरण :
                </h4>
                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        (i) क्या इकाई द्वारा गुणवत्ता प्रमाण पत्र प्राप्त किया
                        गया है? (यदि हाँ, तो विवरण दें)
                      </label>
                      <select
                        value={formData.qualityCert}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: "qualityCert",
                              value: e.target.value,
                            },
                          })
                        }
                        className={govtFormStyle.selectField}
                      >
                        <option value="">चयन करें</option>
                        <option>हाँ</option>
                        <option>नहीं</option>
                      </select>
                    </div>
                    {formData.qualityCert === "हाँ" && (
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          विवरण
                        </label>
                        <input
                          type="text"
                          value={formData.qualityCertDesc}
                          onChange={(e) =>
                            handleChange({
                              target: {
                                name: "qualityCertDesc",
                                value: e.target.value,
                              },
                            })
                          }
                          className={govtFormStyle.inputField}
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        (ii) क्या इकाई द्वारा गुणवत्ता मानकों का उपयोग किया गया
                        है? (यदि हाँ, तो विवरण दें)
                      </label>
                      <select
                        value={formData.qualityStandard}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: "qualityStandard",
                              value: e.target.value,
                            },
                          })
                        }
                        className={govtFormStyle.selectField}
                      >
                        <option value="">चयन करें</option>
                        <option>हाँ</option>
                        <option>नहीं</option>
                      </select>
                    </div>
                    {formData.qualityStandard === "हाँ" && (
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          विवरण
                        </label>
                        <input
                          type="text"
                          value={formData.qualityStandardDesc}
                          onChange={(e) =>
                            handleChange({
                              target: {
                                name: "qualityStandardDesc",
                                value: e.target.value,
                              },
                            })
                          }
                          className={govtFormStyle.inputField}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page 9: Human Resources */}
          {currentPage === 9 && (
            <div className={govtFormStyle.sectionContainer}>
              <h3 className={govtFormStyle.sectionTitle}>7. मानव संसाधन</h3>

              <div className="mb-6">
                {/* <h4 className="text-lg font-medium mb-3">
                  चयन एवं प्रशिक्षण की व्यवस्था
                </h4> */}
                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        17. (i) क्या इकाई द्वारा कर्मचारियों के चयन हेतु
                        सेलेक्शन प्रणाली निर्धारित किया गया है? (यदि हाँ, तो
                        विवरण दें)
                      </label>
                      <select
                        value={formData.hireSetup}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: "hireSetup",
                              value: e.target.value,
                            },
                          })
                        }
                        className={govtFormStyle.selectField}
                      >
                        <option value="">चयन करें</option>
                        <option>हाँ</option>
                        <option>नहीं</option>
                      </select>
                    </div>
                    {formData.hireSetup === "हाँ" && (
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          विवरण
                        </label>
                        <input
                          type="text"
                          value={formData.hireSetupDesc}
                          onChange={(e) =>
                            handleChange({
                              target: {
                                name: "hireSetupDesc",
                                value: e.target.value,
                              },
                            })
                          }
                          className={govtFormStyle.inputField}
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        (ii) क्या इकाई द्वारा कर्मचारियों हेतु प्रशिक्षण आयोजित
                        किया गया है? (यदि हाँ, तो विवरण दें)
                      </label>
                      <select
                        value={formData.training}
                        onChange={(e) =>
                          handleChange({
                            target: { name: "training", value: e.target.value },
                          })
                        }
                        className={govtFormStyle.selectField}
                      >
                        <option value="">चयन करें</option>
                        <option>हाँ</option>
                        <option>नहीं</option>
                      </select>
                    </div>
                    {formData.training === "हाँ" && (
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          विवरण
                        </label>
                        <input
                          type="text"
                          value={formData.trainingDesc}
                          onChange={(e) =>
                            handleChange({
                              target: {
                                name: "trainingDesc",
                                value: e.target.value,
                              },
                            })
                          }
                          className={govtFormStyle.inputField}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">
                  18. कर्मचारियों को दी जाती सुविधाएं
                </h4>
                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(formData.facilities).map(
                      ([facility, value]) => (
                        <div key={facility} className="flex items-center">
                          <input
                            type="checkbox"
                            id={facility}
                            checked={value}
                            onChange={() => toggleFacility(facility)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={facility}
                            className="ml-2 block text-sm text-gray-700"
                          >
                            {facility === "toilet"
                              ? "शौचालय"
                              : facility === "canteen"
                              ? "कैंटीन"
                              : facility === "health"
                              ? "स्वास्थ्य सुविधा"
                              : facility === "recreation"
                              ? "मनोरंजन"
                              : facility === "library"
                              ? "पुस्तकालय"
                              : facility === "transport"
                              ? "परिवहन"
                              : facility}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">
                  19. कर्मचारियों/श्रमिको के लिये पेंशन योजना में योगदान की
                  जानकारी : (संक्षिप्त विवरण दें एवं दस्तावेज संलग्न करें)
                </h4>
                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <textarea
                    value={formData.pensionInfo}
                    onChange={(e) =>
                      handleChange({
                        target: { name: "pensionInfo", value: e.target.value },
                      })
                    }
                    rows="3"
                    placeholder="विवरण दें एवं दस्तावेज संलग्न करें"
                    className={govtFormStyle.inputField}
                  ></textarea>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">
                      दस्तावेज संलग्न करें (PDF/JPG/PNG)
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange("pensionDocument")}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="mt-1 block h-9 w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
                    />
                    {formData.pensionDocument && (
                      <div className="mt-2 flex items-center">
                        <span className="text-sm text-gray-600">
                          {formData.pensionDocument.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              pensionDocument: null,
                            }))
                          }
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page 10: Environment, Business Development & Additional Info */}
          {currentPage === 10 && (
            <>
              {/* Environment & Compliance */}
              <div className={govtFormStyle.sectionContainer}>
                <h3 className={govtFormStyle.sectionTitle}>
                  8. पर्यावरण एवं अनुपालन
                </h3>

                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-3">
                    20. प्रदूषण नियंत्रण मानकों का उपयोग :
                  </h4>
                  {formData.pollution.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded shadow-sm mb-3 border border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            उपकरण नाम
                          </label>
                          <input
                            value={item.name}
                            onChange={(e) =>
                              handleArrayChange(
                                "pollution",
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            className={govtFormStyle.inputField}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            स्थापना वर्ष
                          </label>
                          <select
                            value={item.year}
                            onChange={(e) =>
                              handleArrayChange(
                                "pollution",
                                index,
                                "year",
                                e.target.value
                              )
                            }
                            className={govtFormStyle.inputField}
                          >
                            <option value="">वर्ष चुनें</option>
                            {Array.from(
                              { length: new Date().getFullYear() - 1999 }, // 2000 to current year
                              (_, i) => new Date().getFullYear() - i // Recent years first
                            ).map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            ₹ लागत
                          </label>
                          <input
                            type="number"
                            value={item.cost}
                            min="0"
                            onChange={(e) =>
                              handleArrayChange(
                                "pollution",
                                index,
                                "cost",
                                e.target.value
                              )
                            }
                            className={govtFormStyle.inputField}
                          />
                        </div>
                        <div className="flex items-end">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeArrayItem("pollution", index)
                              }
                              className="text-red-600 text-sm hover:text-red-800 flex items-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              हटाएँ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem("pollution", {
                        name: "",
                        year: "",
                        cost: "",
                      })
                    }
                    className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    नया जोड़ें
                  </button>
                </div>
              </div>

              {/* Business Development */}
              <div className={`${govtFormStyle.sectionContainer} mt-6`}>
                <h3 className={govtFormStyle.sectionTitle}>
                  9. व्यावसायिक विकास
                </h3>

                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-3">
                    21. क्या वेण्डर डेवलपमेंट कार्यक्रम का आयोजन किया गया है?
                    (यदि हाँ, तो विवरण दें)
                  </h4>
                  <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          आयोजन किया गया?
                        </label>
                        <select
                          value={formData.vendorDev}
                          onChange={(e) =>
                            handleChange({
                              target: {
                                name: "vendorDev",
                                value: e.target.value,
                              },
                            })
                          }
                          className={govtFormStyle.selectField}
                        >
                          <option value="">चयन करें</option>
                          <option>हाँ</option>
                          <option>नहीं</option>
                        </select>
                      </div>
                      {formData.vendorDev === "हाँ" && (
                        <div className="md:col-span-2">
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            विवरण
                          </label>
                          <input
                            type="text"
                            value={formData.vendorDevDesc}
                            onChange={(e) =>
                              handleChange({
                                target: {
                                  name: "vendorDevDesc",
                                  value: e.target.value,
                                },
                              })
                            }
                            className={govtFormStyle.inputField}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className={`${govtFormStyle.sectionContainer} mt-6`}>
                <h3 className={govtFormStyle.sectionTitle}>
                  10. अतिरिक्त जानकारी
                </h3>

                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-3">
                    22. अन्य कोई जानकारी, जो आवश्यक समझें
                  </h4>
                  <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                    <textarea
                      value={formData.otherInfo}
                      onChange={(e) =>
                        handleChange({
                          target: { name: "otherInfo", value: e.target.value },
                        })
                      }
                      rows="4"
                      placeholder="कोई अन्य जानकारी यहाँ दें..."
                      className={govtFormStyle.inputField}
                    ></textarea>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* Page 11: Verification */}
          {currentPage === 11 && (
            <div className={govtFormStyle.sectionContainer}>
              <h2 className="text-xl font-bold text-center underline">
                सत्यापन
              </h2>

              <div className="mt-6 p-4 border rounded-lg bg-white space-y-6 text-justify leading-7 text-[17px]">
                <p>
                  मैं, सत्यापित करता हूँ कि म.प्र. सूक्ष्म, लघु और मध्यम उद्योग
                  राज्य स्तरीय पुरस्कार योजना अंतर्गत{" "}
                  <input
                    type="text"
                    name="verificationUnitName"
                    value={formData.unitName}
                    onChange={handleChange}
                    className="border-b border-black w-72 mx-2 focus:outline-none"
                    placeholder="(इकाई का नाम)"
                  />{" "}
                  के आवेदन पत्र के बिंदु क्रमांक 1 से 22 तक दी गई समस्त जानकारी
                  एवं पुष्टि हेतु संलग्न समस्त अभिलेख सही है और इकाई की ओर से
                  उक्त जानकारी देने के लिये मैं अधिकृत हूँ। इकाई किसी तरह के कर
                  अपवंचन श्रेणी में नहीं आती है। इकाई द्वारा श्रम कानूनों, बाल
                  श्रमिक कानूनों का उल्लंघन नहीं किया गया है। इकाई अपने
                  कर्मचारियों/श्रमिकों के लिये पेंशन योजना के प्रावधानों का
                  उल्लंघन नहीं कर रही है। इकाई भारत सरकार/राज्य शासन के नियमों
                  एवं वैधानिक औपचारिकताओं का उल्लंघन नहीं कर रही है और न ही इकाई
                  में किसी तरह की आपराधिक गतिविधि संचालित है। उपरोक्त में से कोई
                  भी जानकारी गलत पाये जाने पर मेरा आवेदन/पुरस्कार निरस्त मान्य
                  किया जाये।
                </p>

                <div>
                  <strong>संलग्न :- </strong>सत्यापन की सूची
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <label className="whitespace-nowrap">दिनांक :</label>
                  <input
                    type="date"
                    name="verificationDate"
                    value={formData.verificationDate || ""}
                    onChange={handleChange}
                    className="border border-gray-400 rounded px-3 py-1"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                 <div className="mt-8 text-right space-y-2">
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-4">
                      <span>(आवेदक के हस्ताक्षर)</span>
                      <div className="relative">
                        {formData.signature &&
                        formData.signature instanceof File ? (
                          <>
                            <img
                              src={URL.createObjectURL(formData.signature)}
                              alt="Signature"
                              className="h-20 w-40 border border-gray-300 object-contain"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  signature: null,
                                }))
                              }
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer">
                            <div className="h-20 w-40 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                              हस्ताक्षर अपलोड करें
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileChange("signature")}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      (JPG/PNG, अधिकतम आकार: 2MB)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="inline-block w-24 font-semibold">
                        नाम :
                      </span>
                      <input
                        type="text"
                        name="applicantName"
                        value={formData.applicantName}
                        onChange={handleChange}
                        className="border-b border-black w-60 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="inline-block w-24 font-semibold">
                        पद :
                      </span>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="border-b border-black w-60 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="inline-block w-24 font-semibold">
                        मोबाइल नंबर :
                      </span>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="border-b border-black w-60 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="inline-block w-24 font-semibold">
                        ई-मेल :
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border-b border-black w-60 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between p-6 bg-gray-50 border-t">
          {currentPage > 1 ? (
            <button
              type="button"
              onClick={prevPage}
              className={govtFormStyle.buttonSecondary}
            >
              पिछला पृष्ठ
            </button>
          ) : (
            <div></div>
          )}

          {currentPage < 11 ? (
            <button
              type="button"
              onClick={nextPage}
              className={govtFormStyle.buttonPrimary}
            >
              अगला पृष्ठ
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`${govtFormStyle.buttonPrimary} ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "जमा हो रहा है..." : "आवेदन जमा करें"}
            </button>
          )}
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">सहायता</h3>
        <p className="text-sm text-gray-700 mb-2">
          <strong>संपर्क नंबर:</strong> 0755-XXXXXXXX
        </p>
        <p className="text-sm text-gray-700 mb-2">
          <strong>ईमेल:</strong> msme-help@mp.gov.in
        </p>
        <p className="text-sm text-gray-700">
          किसी भी प्रश्न या सहायता के लिए कृपया उपरोक्त संपर्क विवरण का उपयोग
          करें।
        </p>
      </div>
    </div>
  );
}

export default MSMEAwardApplicationPage;