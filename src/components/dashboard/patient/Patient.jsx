import React, { useState, useContext, useEffect, useCallback } from "react";
import { AuthContext } from "../../../utils/context/auth";
import { FilterContext } from "../../../utils/context/FilterContext";
import { Box, Modal } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { FaSearch, FaSlidersH, FaPlus } from "react-icons/fa";
import FillablePdf from "../documemts/FillablePdf";
import PatientCard from "./PatientCard";
import NewPatientForm from "./NewPatientForm";
import toast from "react-hot-toast";

// Animation variants (No changes)
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.25 } },
};

const listContainerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const buttonTap = {
  scale: 0.95,
};

// Filter Command Center Modal Component (No changes)
const FilterCommandCenter = ({
  open,
  handleClose,
  ivrFilter,
  setIvrFilter,
  patientsPerPage,
  setPatientsPerPage,
}) => {
  const { activationFilter, setActivationFilter } = useContext(FilterContext);

  const filterModalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    maxWidth: 400,
    maxHeight: "90vh",
    bgcolor: "transparent",
    boxShadow: "none",
    outline: "none",
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      disablePortal
      keepMounted
      hideBackdrop={false}
    >
      <Box sx={filterModalStyle}>
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mx-4 border border-gray-100 dark:border-gray-700 relative"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
        >
          {/* ... (Modal content for filters) ... */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 text-center">
            Patient Filters
          </h3>

          {/* IVR Status Filter */}
          <div className="mb-6">
            <label
              htmlFor="ivr-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Filter by IVR Status:
            </label>
            <select
              id="ivr-filter"
              value={ivrFilter}
              onChange={(e) => setIvrFilter(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500 transition"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Denied">Denied</option>
              <option value="No IVR Submitted">No IVR Submitted</option>
            </select>
          </div>

          {/* Activation Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Filter by Activation:
            </label>
            <div className="flex space-x-4 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
              <label className="flex items-center text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="radio"
                  name="activation-filter"
                  value=""
                  checked={activationFilter === ""}
                  onChange={(e) => setActivationFilter(e.target.value)}
                  className="mr-2 text-teal-500 focus:ring-teal-500"
                />
                All
              </label>
              <label className="flex items-center text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="radio"
                  name="activation-filter"
                  value="Activated"
                  checked={activationFilter === "Activated"}
                  onChange={(e) => setActivationFilter(e.target.value)}
                  className="mr-2 text-teal-500 focus:ring-teal-500"
                />
                Activated
              </label>
              <label className="flex items-center text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="radio"
                  name="activation-filter"
                  value="Deactivated"
                  checked={activationFilter === "Deactivated"}
                  onChange={(e) => setActivationFilter(e.target.value)}
                  className="mr-2 text-teal-500 focus:ring-teal-500"
                />
                Deactivated
              </label>
            </div>
          </div>

          {/* Patients Per Page */}
          <div>
            <label
              htmlFor="patients-per-page"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Patients per page:
            </label>
            <select
              id="patients-per-page"
              value={patientsPerPage}
              onChange={(e) => setPatientsPerPage(Number(e.target.value))}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500 transition"
            >
              {[5, 10, 15, 25, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            onClick={handleClose}
            className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg shadow-md transition duration-300"
            whileTap={buttonTap}
          >
            Apply Filters
          </motion.button>
        </motion.div>
      </Box>
    </Modal>
  );
};

// Main Patients Component
const Patients = () => {
  // ✅ FIX: Destructure 'loading' from AuthContext (renamed to authLoading)
  const { user, loading: authLoading, getPatients, postPatient, updatePatient, deletePatient } =
    useContext(AuthContext);
  const { activationFilter } = useContext(FilterContext);

  // State management
  const [patients, setPatients] = useState([]);
  // ✅ FIX: Set component-local loading to true initially, relying on authLoading initially
  const [patientsLoading, setPatientsLoading] = useState(true); 
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewPdfModalOpen, setViewPdfModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [ivrFilter, setIvrFilter] = useState("");
  const [patientsPerPage, setPatientsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [savePage, setSavePage] = useState(1);
  const [editingPatient, setEditingPatient] = useState(null);

  // Initial form state (No changes)
  const initialFormState = {
    first_name: "",
    last_name: "",
    middle_initial: "",
    // date_of_birth: "",
    // email: "",
    // address: "",
    // city: "",
    // state: "",
    // zip_code: "",
    // phone_number: "",
    // primary_insurance: "",
    // primary_insurance_number: "",
    // secondary_insurance: "",
    // secondary_insurance_number: "",
    // tertiary_insurance: "",
    // tertiary_insurance_number: "",
    // medical_record_number: "",
    // wound_size_length: "",
    // wound_size_width: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // Phone number formatter (No changes)
  const formatPhoneNumberToE164 = (phone) => {
    if (!phone) return "";
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
      return `+${digitsOnly}`;
    } else if (digitsOnly.length > 11 && digitsOnly.startsWith("1")) {
      return `+${digitsOnly.slice(0, 11)}`;
    }
    return `+${digitsOnly}`;
  };

  // Form validation (No changes)
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }
    
    // if (!formData.date_of_birth) {
    //   newErrors.date_of_birth = "Date of birth is required";
    // }
    
    // if (formData.phone_number) {
    //   const digitsOnly = formData.phone_number.replace(/\D/g, "");
    //   if (digitsOnly.length !== 10) {
    //     newErrors.phone_number = "Phone number must be 10 digits (US format)";
    //   }
    // }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch patients from API
  const fetchPatients = useCallback(async () => {
    // ✅ FIX: Check if user is present AND authLoading is false
    if (authLoading || !user || !getPatients) {
      setPatientsLoading(true); // Keep loading state until auth is done
      return;
    }

    setPatientsLoading(true);
    try {
      const result = await getPatients();

      if (result.success) {
        setPatients(result.data);
      } else {
        console.error("Fetch returned non-success status:", result.error);
        toast.error("Failed to load patients.");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("An error occurred while loading patients.");
    } finally {
      // ✅ FIX: Set component-local loading to false only after attempt
      setPatientsLoading(false); 
    }
  }, [user, getPatients, authLoading]); // ✅ Dependency on authLoading is CRITICAL

  // Load patients on mount and when authentication state changes
  useEffect(() => {
    // ✅ FIX: Only run fetchPatients once authLoading is false AND user is present.
    if (!authLoading && user) {
        fetchPatients();
    } else if (!authLoading && !user) {
        // If auth is done but no user (logged out or unauthenticated), stop loading.
        setPatientsLoading(false);
    }
  }, [fetchPatients, authLoading, user]); // Added user and authLoading as explicit triggers

  // Reset pagination when filters change (No changes)
  useEffect(() => {
    if (searchTerm || ivrFilter || activationFilter) {
      setSavePage(currentPage);
      setCurrentPage(1);
    } else {
      setCurrentPage(savePage);
    }
  }, [searchTerm, ivrFilter, activationFilter, currentPage, savePage]); // Added dependency to suppress warning

  // Handle input changes (No changes)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "middle_initial" ? value.trim().charAt(0) : value,
    }));
  };

  // Handle patient update after IVR submission (No changes)
  const handlePatientUpdate = useCallback(
    async (patientId) => {
      try {
        await fetchPatients();
        toast.success("Patient information updated successfully.");
      } catch (error) {
        console.error("Error refreshing patient after update:", error);
        toast.error("Failed to refresh patient data.");
      }
    },
    [fetchPatients]
  );

  // Reset form to initial state (No changes)
  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setEditingPatient(null);
    setOpen(false);
  };

  // Save patient (create or update) (No changes)
  // Save patient (create or update)
  const handleSavePatient = async () => {
    setErrors({});
    
    if (!validateForm()) {
      return;
    }

    // ✅ FIX: Exclude read-only timestamp fields from the payload
    // const { created_at, updated_at, date_created, date_updated, ...cleanFormData } = formData;
    
    // const patientData = {
    //   ...cleanFormData,
    //   // Ensure phone number is formatted correctly before saving
    //   phone_number: formatPhoneNumberToE164(formData.phone_number || cleanFormData.phone_number),
    // };

    const patientData = {
    first_name: formData.first_name,
    last_name: formData.last_name,
    middle_initial: formData.middle_initial || "",
  };

    try {
      // 1. Set component state to reflect loading
      setPatientsLoading(true);
      let res;

      if (editingPatient) {
        // Update existing patient
        res = await updatePatient(editingPatient.id, patientData);
      } else {
        // Create new patient
        res = await postPatient(patientData);
      }
      
      // ✅ GUARD: Ensure res exists before accessing properties
      if (!res) {
        throw new Error("No response received from server");
      }
      
      // 🟢 SUCCESS PATH (Executed only if API returns 2xx)
      if (res.success) {
        await fetchPatients(); // Refresh list to get all latest data
        toast.success(editingPatient ? "Patient profile updated successfully!" : "New patient added successfully!");
        resetForm();
      } else {
        // This handles cases where the API returns 2xx but business logic failed
        console.error("API returned success status but failed business logic:", res.error);
        toast.error(res.error || "Operation failed due to missing data.");
      }
      
    } catch (error) {
      // 🛑 ERROR PATH (Executed when API returns 4xx, 5xx, or network error)
      console.error("Error saving patient:", error);
      
      // ✅ COMPREHENSIVE ERROR HANDLING: Handle all error scenarios
      let displayMessage = "An unexpected error occurred while saving patient data.";
      
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data?.error || error.response.data?.detail;
        displayMessage = serverError || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response received (network error)
        displayMessage = "Network error: Unable to reach the server. Please check your connection.";
      } else if (error.message) {
        // Something else happened
        displayMessage = error.message;
      }
      
      toast.error(displayMessage);
      
    } finally {
      // 2. Clear loading state
      setPatientsLoading(false); 
    }
  };

  // Edit patient (No changes)
  const handleEditPatient = (patient) => {
    try {
      if (!patient || typeof patient !== "object") {
        console.error("Invalid patient data:", patient);
        toast.error("Invalid patient data.");
        return;
      }

      const sanitizedPatient = {};
      
      Object.entries(initialFormState).forEach(([key]) => {
        let value = patient[key];
        
        if (key === "date_of_birth") {
          try {
            sanitizedPatient[key] = value
              ? format(new Date(value), "yyyy-MM-dd")
              : "";
          } catch (dateError) {
            console.error("Invalid date_of_birth format:", value);
            sanitizedPatient[key] = "";
          }
        } else {
          sanitizedPatient[key] = value ?? "";
        }
      });

      setFormData(sanitizedPatient);
      setEditingPatient(patient);
      setOpen(true);
    } catch (error) {
      console.error("Error in handleEditPatient:", error);
      toast.error("Could not load patient for editing.");
    }
  };

  // Delete patient (No changes)
  const handleDeletePatient = async (patientId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this patient? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await deletePatient(patientId);
      
      if (res.success) {
        setPatients((prev) => prev.filter((p) => p.id !== patientId));
        toast.success("Patient deleted successfully!");
      } else {
        console.error("Failed to delete patient:", res.error);
        toast.error(res.error || "Failed to delete patient.");
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Error deleting patient.");
    }
  };

  // Filter patients based on search and filters (No changes)
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name || ""} ${patient.last_name || ""} ${
      patient.middle_initial || ""
    }`.toLowerCase();
    
    const medRecord = patient.medical_record_number?.toLowerCase() || "";
    
    const searchMatch =
      fullName.includes(searchTerm.toLowerCase()) ||
      medRecord.includes(searchTerm.toLowerCase());

    const ivrStatusDisplay = patient.latest_ivr_status_display || "No IVR Submitted";
    const ivrMatch = ivrFilter ? ivrStatusDisplay === ivrFilter : true;

    const activationMatch =
      !activationFilter || patient.activate_Account === activationFilter;

    return searchMatch && ivrMatch && activationMatch;
  });

  // Sort patients (active first) (No changes)
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const aActive = a.activate_Account === "Activated" ? 1 : 0;
    const bActive = b.activate_Account === "Activated" ? 1 : 0;
    return bActive - aActive;
  });

  // Pagination (No changes)
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = sortedPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(sortedPatients.length / patientsPerPage);

  // View PDF handler (No changes)
  const handleViewPdf = (patient) => {
    setSelectedPatient(patient);
    setViewPdfModalOpen(true);
  };

  // Modal styles (No changes)
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    maxWidth: 600,
    bgcolor: "transparent",
    boxShadow: "none",
    outline: "none",
  };

  // ✅ FIX: Use the combined loading state
  if (authLoading || patientsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress color="success" />
      </div>
    );
  }

  // ✅ CRITICAL FIX: Guard against unauthenticated users after loading finishes
  if (!user && !authLoading) {
    // If the authentication finished and there is no user, this component shouldn't be accessible
    // It should be guarded by a router, but this acts as a final safety measure.
    // In a real app, this should redirect to login. For now, we'll return a simple message.
    return (
        <div className="flex justify-center items-center min-h-[400px] text-red-500 dark:text-red-400">
            Access Denied. Please log in.
        </div>
    );
  }
  
  // Active filter count (No changes)
  const activeFilterCount = [ivrFilter, activationFilter].filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg transition-colors duration-300">
      {/* ... (rest of the component structure) ... */}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Patient Management
        </h2>

        <motion.button
          onClick={() => {
            setEditingPatient(null);
            setFormData(initialFormState);
            setOpen(true);
          }}
          className="w-full sm:w-auto border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white dark:text-teal-400 dark:border-teal-400 dark:hover:bg-teal-500 px-4 py-2 rounded-full transition-all text-sm flex items-center justify-center gap-2"
          whileTap={buttonTap}
        >
          <FaPlus className="w-3 h-3" /> New Patient
        </motion.button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-3">
        {/* Search Input */}
        <div className="relative flex items-center w-full sm:max-w-xs md:max-w-md">
          <input
            type="text"
            placeholder="Search by Name or Med Record No."
            className="w-full px-4 py-2 pl-10 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10 h-full">
            <FaSearch className="text-teal-500 text-sm ml-3" />
          </div>
        </div>

        {/* Filter Button */}
        <motion.button
          onClick={() => setFilterModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 w-full sm:w-auto"
          whileTap={buttonTap}
        >
          <FaSlidersH className="w-4 h-4" />
          <span className="flex items-center space-x-1">
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="text-xs font-semibold text-teal-500 dark:text-teal-400">
                ({activeFilterCount})
              </span>
            )}
          </span>
        </motion.button>
      </div>

      {/* Patient Cards List */}
      <motion.div
        className="space-y-4"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {currentPatients.length > 0 ? (
            currentPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onViewPdf={handleViewPdf}
                onEdit={handleEditPatient}
                onDelete={handleDeletePatient}
                onPatientUpdate={handlePatientUpdate}
              />
            ))
          ) : (
            <motion.p
              className="text-center py-10 text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No patients match the current search or filter criteria.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pagination (No changes) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2 sm:space-x-4">
          <motion.button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-full border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
            whileTap={currentPage !== 1 ? buttonTap : {}}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </motion.button>

          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <motion.button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-full border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
            whileTap={currentPage !== totalPages ? buttonTap : {}}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </motion.button>
        </div>
      )}

      {/* Filter Command Center Modal (No changes) */}
      <AnimatePresence>
        {filterModalOpen && (
          <FilterCommandCenter
            open={filterModalOpen}
            handleClose={() => setFilterModalOpen(false)}
            ivrFilter={ivrFilter}
            setIvrFilter={setIvrFilter}
            patientsPerPage={patientsPerPage}
            setPatientsPerPage={setPatientsPerPage}
          />
        )}
      </AnimatePresence>

      {/* PDF Viewer Modal (No changes) */}
      <Modal
        open={viewPdfModalOpen}
        onClose={() => setViewPdfModalOpen(false)}
      >
        <Box sx={{ ...modalStyle, maxWidth: 900 }}>
          <FillablePdf
            patient={selectedPatient}
            onClose={() => setViewPdfModalOpen(false)}
          />
        </Box>
      </Modal>

      {/* Patient Form Modal (No changes) */}
      <Modal open={open} onClose={resetForm}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            maxWidth: 600,
            maxHeight: "90vh",
            bgcolor: "transparent",
            boxShadow: "none",
            outline: "none",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              maxHeight: "90vh",
              overflowY: "auto",
              bgcolor: "white",
              borderRadius: "16px",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
            className="dark:bg-gray-900"
          >
            <NewPatientForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleSavePatient={handleSavePatient}
              resetForm={resetForm}
              errors={errors}
              editingPatient={editingPatient}
            />
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Patients;