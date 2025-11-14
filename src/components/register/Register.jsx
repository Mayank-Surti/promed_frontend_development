import React, { useState, useContext } from "react";
import { AuthContext } from "../../utils/context/auth";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoArrowBack,
  IoCheckmarkCircle,
  IoEyeOutline,
  IoEyeOffOutline,
  IoAlertCircle,
} from "react-icons/io5";
import toast from "react-hot-toast";
import register_bg_img_2 from "../../assets/images/register_bg_img.jpg";
import { countryCodesList } from "../../utils/data";
import { states } from "../../utils/data/index";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";
// --- START: COMPONENTS OUTSIDE REGISTER ---

const StepIndicator = ({ step, currentStep }) => (
  <div className="flex items-center">
    <motion.div
      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
        currentStep >= step
          ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white"
          : "bg-white/10 text-gray-400"
      }`}
      whileHover={{ scale: 1.1 }}
    >
      {currentStep > step ? <IoCheckmarkCircle size={24} /> : step}
    </motion.div>
  </div>
);

const InputField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  error,
  helperText,
  disabled,
  ...props
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-300 mb-2">
      {label}
    </label>
    <div className="relative group">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${
          icon ? "pl-12" : "pl-4"
        } pr-4 py-4 bg-white/5 border ${
          error ? "border-red-500/50" : "border-white/10"
        } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
          error ? "focus:ring-red-500/50" : "focus:ring-teal-500/50"
        } ${
          error ? "focus:border-red-500" : "focus:border-teal-500"
        } transition-all duration-300 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        {...props}
      />
    </div>
    {helperText && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-2 text-xs flex items-center gap-1 ${
          error ? "text-red-400" : "text-gray-400"
        }`}
      >
        {error && <IoAlertCircle className="text-sm" />}
        {helperText}
      </motion.p>
    )}
  </div>
);

// --- END: COMPONENTS OUTSIDE REGISTER ---

const Register = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    npiNumber: "",
    countryCode: "+1",
    password: "",
    password2: "",
    zipCode: "",
    city: "",
    state: "",
    country: "",
    facility: "",
    facilityPhoneNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingZip, setIsLoadingZip] = useState(false);
  const [zipError, setZipError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();

  // Password validation
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = (formData.password.match(/[A-Z]/g) || []).length >= 1;
  const hasLowercase = (formData.password.match(/[a-z]/g) || []).length >= 1;
  const hasNumbers = (formData.password.match(/[0-9]/g) || []).length >= 1;
  const hasSpecialChars =
    (formData.password.match(/[^A-Za-z0-9]/g) || []).length >= 1;

  const passwordRequirements = [
    { met: hasMinLength, text: "Minimum 8 characters" },
    { met: hasUppercase, text: "At least one uppercase letter" },
    { met: hasLowercase, text: "At least one lowercase letter" },
    { met: hasNumbers, text: "At least one number" },
    { met: hasSpecialChars, text: "At least one special character/symbol" },
  ];

  // ✅ NPI Validation
  const isValidNPI = (npi) => {
    // Remove any non-digit characters
    const digitsOnly = npi.replace(/\D/g, "");
    // Must be exactly 10 digits
    return digitsOnly.length === 10;
  };

  const npiError = formData.npiNumber && !isValidNPI(formData.npiNumber);

  // ✅ Step 1 Validation - Check if all required fields are filled and NPI is valid
  const isStep1Valid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.npiNumber.trim() !== "" &&
      isValidNPI(formData.npiNumber) &&
      !fieldErrors.email &&
      !fieldErrors.phoneNumber &&
      !fieldErrors.npiNumber
    );
  };

  // ✅ Step 2 Validation
  const isStep2Valid = () => {
    return (
      formData.facility.trim() !== "" &&
      formData.facilityPhoneNumber.trim() !== "" &&
      formData.zipCode.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state.trim() !== "" &&
      formData.country.trim() !== ""
    );
  };

  const handleChange = (field, value) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
  // Clear field error when user starts typing
  if (fieldErrors[field]) {
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  }
};

  // Fetch city and state from ZIP code
  const fetchLocationFromZip = async (zip) => {
    // Only fetch if we have exactly 5 digits
    if (zip.length !== 5) {
      setZipError("");
      return;
    }

    setIsLoadingZip(true);
    setZipError("");

    try {
      const response = await fetch(`http://api.zippopotam.us/us/${zip}`);
      
      if (!response.ok) {
        throw new Error("Invalid ZIP code");
      }

      const data = await response.json();
      
      if (data.places && data.places.length > 0) {
        const place = data.places[0];
        setFormData((prev) => ({
          ...prev,
          city: place["place name"],
          state: place.state,
          country: data.country,
        }));
        setZipError("");
      }
    } catch (error) {
      setZipError("Invalid ZIP code or unable to fetch location");
      setFormData((prev) => ({
        ...prev,
        city: "",
        state: "",
        country: "",
      }));
    } finally {
      setIsLoadingZip(false);
    }
  };

  // Handle ZIP code input
  const handleZipChange = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 5 characters
    const digitsOnly = value.replace(/\D/g, "").slice(0, 5);
    handleChange("zipCode", digitsOnly);
    
    // Auto-fetch when 5 digits are entered
    if (digitsOnly.length === 5) {
      fetchLocationFromZip(digitsOnly);
    } else {
      // Clear city/state if ZIP is incomplete
      setFormData((prev) => ({
        ...prev,
        city: "",
        state: "",
        country: "",
      }));
      setZipError("");
    }
  };

  // ✅ Handle NPI input - only allow digits
  const handleNPIChange = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    handleChange("npiNumber", digitsOnly);
  };


const validateStep1 = async () => {
  setIsValidating(true);
  setFieldErrors({});
  
  const formattedPhoneNumber = `${formData.countryCode}${formData.phoneNumber.replace(/\D/g, "")}`;
  
  // Create payload for validation
  const validationPayload = {
    full_name: formData.fullName,
    email: formData.email,
    phone_number: formattedPhoneNumber,
    country_code: formData.countryCode,
    npi_number: formData.npiNumber,
    password: "TempPass123!", // Dummy password just for validation
    password2: "TempPass123!",
  };

  try {
    // Call the VALIDATION endpoint (not registration)
    await axios.post(`${API_BASE_URL}/provider/validate-registration/`, validationPayload);
    
    // If successful, fields are valid
    setIsValidating(false);
    return true;
  } catch (error) {
    setIsValidating(false);
    
    console.log("🔴 Validation Error Response:", error.response?.data);
    if (error.response?.data) {
      const errors = error.response.data;
      const newFieldErrors = {};
      
      // Map backend errors to field errors
      if (errors.phone_number) {
        newFieldErrors.phone_number = Array.isArray(errors.phone_number) 
          ? errors.phone_number[0] 
          : errors.phone_number;
      }
      if (errors.email) {
        newFieldErrors.email = Array.isArray(errors.email) 
          ? errors.email[0] 
          : errors.email;
      }
      if (errors.npi_number) {
        newFieldErrors.npi_number = Array.isArray(errors.npi_number) 
          ? errors.npi_number[0] 
          : errors.npi_number;
      }
      
      setFieldErrors(newFieldErrors);
      
      // Show error message
      const errorMessages = Object.values(newFieldErrors).join(". ");
      if (errorMessages) {
        toast.error(errorMessages);
        return false;
      }
    }
    
    return false;
  }
};

// ✅ Handle step progression with validation
const handleNextStep = async () => {
  if (currentStep === 1) {
    const isValid = await validateStep1();
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  } else {
    setCurrentStep(currentStep + 1);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const formattedPhoneNumber = `${
      formData.countryCode
    }${formData.phoneNumber.replace(/\D/g, "")}`;
    const formattedFacilityPhoneNumber = formData.facilityPhoneNumber.replace(
      /\D/g,
      ""
    );

    if (formData.password !== formData.password2) {
      setErrorMsg("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (
      !(
        hasMinLength &&
        hasUppercase &&
        hasLowercase &&
        hasNumbers &&
        hasSpecialChars
      )
    ) {
      setErrorMsg("Password does not meet all complexity requirements.");
      setIsLoading(false);
      return;
    }

    // ✅ Final NPI validation before submission
    if (!isValidNPI(formData.npiNumber)) {
      setErrorMsg("NPI number must be exactly 10 digits.");
      setIsLoading(false);
      return;
    }

    const payload = {
      full_name: formData.fullName,
      email: formData.email,
      phone_number: formattedPhoneNumber,
      country_code: formData.countryCode,
      password: formData.password,
      password2: formData.password2,
      npi_number: formData.npiNumber,
      zip_code: formData.zipCode,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      facility: formData.facility,
      facility_phone_number: formattedFacilityPhoneNumber,
    };

    const result = await register(payload);

    if (result.success) {
      toast.success(
        "Account created! Please check your email to verify your account.",
        { duration: 5000 }
      );
      navigate("/login");
    } else {
      const error = result.error;
      if (typeof error === "object") {
        const messages = Object.values(error).flat().join(" ");
        setErrorMsg(messages);
      } else {
        setErrorMsg(error);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6 z-50"
        >
          <Link
            to="/"
            className="group flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full shadow-xl transition-all duration-300 border border-white/20"
          >
            <IoArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Left Panel */}
        <motion.div
          className="hidden lg:flex lg:w-2/5 relative"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${register_bg_img_2})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>

          <div className="relative z-10 flex items-center px-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-xl flex items-start gap-6"
            >
              <div className="w-3 h-20 bg-gradient-to-b from-teal-400 to-blue-500 rounded-full mt-6"></div>

              <div>
                <h1 className="text-6xl font-semibold text-white mb-4">
                  Join
                  <span className="block text-teal-400">ProMed</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Securely manage your patient care and medical supplies with
                  our comprehensive platform.
                </p>

                <div className="mt-12 space-y-4">
                  {["HIPAA Compliant", "Real-time Updates", "24/7 Support"].map(
                    (feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + idx * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <IoCheckmarkCircle className="text-teal-400 text-2xl" />
                        <span className="text-gray-300">{feature}</span>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
          <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-3">
                Create Account
              </h2>
              <p className="text-gray-400">Enter your details to get started</p>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-4 mb-8">
              <StepIndicator step={1} currentStep={currentStep} />
              <div className="flex-1 max-w-[100px] h-1 bg-white/10 rounded-full self-center">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: currentStep >= 2 ? "100%" : "0%" }}
                />
              </div>
              <StepIndicator step={2} currentStep={currentStep} />
              <div className="flex-1 max-w-[100px] h-1 bg-white/10 rounded-full self-center">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: currentStep >= 3 ? "100%" : "0%" }}
                />
              </div>
              <StepIndicator step={3} currentStep={currentStep} />
            </div>

            <motion.div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">
                        Personal Information
                      </h3>
                      <InputField
                        label="Full Name"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleChange("fullName", e.target.value)
                        }
                        placeholder="John Doe"
                        required
                      />
                      <InputField
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="john@example.com"
                        error={!!fieldErrors.email}
                        helperText={fieldErrors.email}
                        required
                      />
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={formData.countryCode}
                            onChange={(e) =>
                              handleChange("countryCode", e.target.value)
                            }
                            className="w-32 px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                          >
                            {countryCodesList.map((country) => (
                              <option
                                key={country.code}
                                value={country.code}
                                className="bg-slate-800"
                              >
                                {country.flag} {country.code}
                              </option>
                            ))}
                          </select>
                          <div className="flex-1">
                          <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                              handleChange("phoneNumber", e.target.value)
                            }
                            placeholder="555-555-5555"
                            className={`w-full px-4 py-4 bg-white/5 border ${
                              fieldErrors.phone_number ? "border-red-500/50" : "border-white/10"
                            } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                              fieldErrors.phone_number ? "focus:ring-red-500/50" : "focus:ring-teal-500/50"
                            } transition-all duration-300`}
                            required
                          />
                          {fieldErrors.phone_number && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-xs flex items-center gap-1 text-red-400"
                            >
                              <IoAlertCircle className="text-sm" />
                              {fieldErrors.phone_number}
                            </motion.p>
                          )}
                          </div>
                        </div>
                      </div>
                      <InputField
                        label="NPI Number"
                        type="text"
                        value={formData.npiNumber}
                        onChange={handleNPIChange}
                        placeholder="1234567890"
                        maxLength="10"
                        error={npiError || !!fieldErrors.npi_number}
                        helperText={
                          npiError
                            ? "NPI must be exactly 10 digits"
                            : formData.npiNumber
                            ? `${formData.npiNumber.length}/10 digits`
                            : "Enter your 10-digit National Provider Identifier"
                        }
                        required
                      />
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">
                        Facility Information
                      </h3>
                      <InputField
                        label="Facility Name"
                        type="text"
                        value={formData.facility}
                        onChange={(e) =>
                          handleChange("facility", e.target.value)
                        }
                        placeholder="Your Clinic or Hospital"
                        required
                      />
                      <InputField
                        label="Facility Phone"
                        type="tel"
                        value={formData.facilityPhoneNumber}
                        onChange={(e) =>
                          handleChange("facilityPhoneNumber", e.target.value)
                        }
                        placeholder="555-555-5555"
                        required
                      />
                      
                      <InputField
                        label="ZIP Code"
                        type="text"
                        value={formData.zipCode}
                        onChange={handleZipChange}
                        placeholder="46202"
                        maxLength="5"
                        error={!!zipError}
                        helperText={
                          isLoadingZip
                            ? "🔍 Looking up location..."
                            : zipError
                            ? zipError
                            : formData.zipCode && formData.zipCode.length === 5 && formData.city
                            ? "✓ Location found!"
                            : "Enter 5-digit ZIP code to auto-fill location"
                        }
                        required
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          label="City"
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleChange("city", e.target.value)}
                          placeholder="City"
                          disabled={isLoadingZip}
                          required
                        />

                        <InputField
                          label="State"
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleChange("state", e.target.value)}
                          placeholder="State"
                          disabled={isLoadingZip}
                          required
                        />
                      </div>
                      
                      <InputField
                        label="Country"
                        type="text"
                        value={formData.country}
                        onChange={(e) =>
                          handleChange("country", e.target.value)
                        }
                        placeholder="United States"
                        disabled={isLoadingZip}
                        required
                      />
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">
                        Security
                      </h3>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) =>
                              handleChange("password", e.target.value)
                            }
                            placeholder="Create a strong password"
                            className="w-full px-4 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-400"
                          >
                            {showPassword ? (
                              <IoEyeOffOutline size={20} />
                            ) : (
                              <IoEyeOutline size={20} />
                            )}
                          </button>
                        </div>
                        <div className="mt-3 space-y-2">
                          {passwordRequirements.map((req, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex items-center gap-2"
                            >
                              <IoCheckmarkCircle
                                className={`text-lg ${
                                  req.met ? "text-teal-400" : "text-gray-600"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  req.met ? "text-teal-400" : "text-gray-500"
                                }`}
                              >
                                {req.text}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <InputField
                        label="Confirm Password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password2}
                        onChange={(e) =>
                          handleChange("password2", e.target.value)
                        }
                        placeholder="Repeat your password"
                        required
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
                    >
                      <p className="text-red-400 text-sm">{errorMsg}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 mt-8">
                  {currentStep > 1 && (
                    <motion.button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>
                  )}
                  {currentStep < 3 ? (
                    <motion.button
                      type="button"
                      onClick={handleNextStep}
                      disabled={
                        (currentStep === 1 && !isStep1Valid()) ||
                        (currentStep === 2 && !isStep2Valid()) || isValidating
                      }
                      className={`flex-1 py-4 font-bold rounded-xl shadow-lg transition-all ${
                        (currentStep === 1 && !isStep1Valid()) ||
                        (currentStep === 2 && !isStep2Valid()) || isValidating
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white shadow-teal-500/25"
                      }`}
                      whileHover={
                        (currentStep === 1 && isStep1Valid()) ||
                        (currentStep === 2 && isStep2Valid()) && !isValidating
                          ? { scale: 1.02 }
                          : {}
                      }
                      whileTap={
                        (currentStep === 1 && isStep1Valid()) ||
                        (currentStep === 2 && isStep2Valid()) && !isValidating
                          ? { scale: 0.98 }
                          : {}
                      }
                    >
                      {isValidating ? "Please wait..." : "Continue"}  
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </motion.button>
                  )}
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-teal-400 hover:text-teal-300 font-semibold ml-2"
                  >
                    Sign In
                  </Link>
                </p>
              </div>

              {/* EMR/EHR Notice */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4 flex justify-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-xs text-gray-300">
                    <span className="font-semibold text-amber-400">EMR/EHR </span> integrations coming soon
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;