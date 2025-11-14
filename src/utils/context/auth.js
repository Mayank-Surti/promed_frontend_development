import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import axiosAuth from "../axios";

// --- Configuration ---
// Assuming API_BASE_URL is a constant imported from elsewhere (e.g., constants.js)
// If not, you may need to define it here or import it from your config file.
const API_BASE_URL =
  "http://localhost:8000/api/v1";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- State Initialization ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMfaPending, setIsMfaPending] = useState(false);
  const [isBAARequired, setIsBAARequired] = useState(false);

  // --- Helper Functions ---

  const logout = () => {
    console.log("🚪 Logging out - clearing all tokens and state");
    localStorage.clear(); // Clear all localStorage tokens
    sessionStorage.clear(); // Clear all sessionStorage flags
    setUser(null);
    setIsMfaPending(false);
    setIsBAARequired(false);
  };

  const clearMfaState = () => {
    console.log("🧹 Clearing temporary MFA state");
    localStorage.removeItem("session_id");
    localStorage.removeItem("mfa_method");
    setIsMfaPending(false);
  };

  /**
   * Fetches full provider profile and merges essential data.
   * Ensures the returned object is the single source of user data for the context state.
   */
  const fetchUserData = async (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const axiosInstance = axiosAuth(); // Uses the token provided in the header
      const response = await axiosInstance.get("/provider/profile/");

      // UNIFY THE USER OBJECT: Avoid nesting user data under a second 'user' key.
      const unifiedUser = {
        // Base authentication details (from token)
        id: decodedToken.user_id,
        role: decodedToken.role,

        // Profile and related details (from API response)
        ...response.data, // Contains profile info (image, full_name, email, etc.)

        // Critical flags
        has_signed_baa: response.data.has_signed_baa,
      };

      setUser(unifiedUser);
      return unifiedUser;
    } catch (error) {
      console.error("Failed to fetch user data or decode token:", error);
      // Re-throw to be caught by the caller (e.g., verifyCode, initial load)
      throw error;
    }
  };

  // --- Initial Load Effect ---
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const session_id = localStorage.getItem("session_id");
    const baaRequiredStatus =
      sessionStorage.getItem("isBAARequired") === "true";

    if (session_id && !refreshToken) {
      // MFA in progress
      setIsMfaPending(true);
    } else if (baaRequiredStatus && accessToken && !refreshToken) {
      // BAA in progress (temp token exists)
      setIsBAARequired(true);
    } else if (accessToken && refreshToken) {
      // Full session available
      fetchUserData(accessToken).catch(() => {
        // If data fetch fails, assume tokens are stale/invalid
        logout();
      });
    } else {
      // Clean up any stray temp states if no full session is found
      if (session_id) clearMfaState();
      if (baaRequiredStatus) sessionStorage.removeItem("isBAARequired");
    }

    setLoading(false);
    // Note: Dependencies are intentionally limited to run only on mount.
  }, []);

  // --- Core Auth API Functions ---

  const register = async (formData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/provider/register/`,
        formData
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration error:", error.response);
      return {
        success: false,
        error: error.response?.data || "Registration failed",
      };
    }
  };

  // const login = async (email, password, method = "sms") => {
  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/provider/token/`, {
  //       email: email.trim(),
  //       password,
  //       method,
  //     });

  //     const { access, refresh, mfa_required, session_id } = response.data;

  //     // 1. Handle MFA requirement
  //     if (mfa_required) {
  //       localStorage.setItem("accessToken", access);
  //       localStorage.setItem("session_id", session_id);
  //       localStorage.setItem("mfa_method", method);
  //       setIsMfaPending(true);
  //       return { mfa_required: true, session_id, detail: response.data.detail };
  //     }

  //     // 2. Handle successful full login
  //     localStorage.setItem("accessToken", access);
  //     localStorage.setItem("refreshToken", refresh);
  //     clearMfaState(); // ensure any lingering MFA state is gone

  //     await fetchUserData(access); // Populate user state immediately
  //     return { success: true };
  //   } catch (error) {
  //     const errorData = error.response?.data;

  //     // 🔑 Handle BAA Required (403)
  //     if (error.response?.status === 403 && errorData?.baa_required) {
  //       toast.error("Mandatory BAA agreement required.");

  //       localStorage.setItem("accessToken", errorData.access); // Temp token
  //       sessionStorage.setItem("isBAARequired", "true"); // Flag for router

  //       // Note: The backend should return enough data for the profile to function temporarily
  //       setUser(errorData.user || { email: email.trim() });
  //       setIsBAARequired(true);
  //       clearMfaState();

  //       return { baa_required: true, user: errorData.user };
  //     }

  //     // --- Standard Error Parsing ---
  //     let errorMessage =
  //       "Login failed. Please check your credentials and try again.";
  //     // ... (Add your detailed error parsing logic here) ...

  //     clearMfaState();
  //     return { success: false, error: errorMessage };
  //   }
  // };

const login = async (email, password, method = "sms") => {
  try {
    const response = await axios.post(`${API_BASE_URL}/provider/token/`, {
      email: email.trim(),
      password,
      method,
    });

    const { access, refresh, mfa_required, session_id } = response.data;

    // 1. Handle MFA requirement
    if (mfa_required) {
      localStorage.setItem("accessToken", access);
      localStorage.setItem("session_id", session_id);
      localStorage.setItem("mfa_method", method);
      setIsMfaPending(true);
      return { mfa_required: true, session_id, detail: response.data.detail };
    }

    // 2. Handle successful full login
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    clearMfaState(); // ensure any lingering MFA state is gone

    await fetchUserData(access); // Populate user state immediately
    return { success: true };
  } catch (error) {
    const errorData = error.response?.data;

    // 🔑 Handle BAA Required (403)
    if (error.response?.status === 403 && errorData?.baa_required) {
      localStorage.setItem("accessToken", errorData.access); // Temp token
      sessionStorage.setItem("isBAARequired", "true"); // Flag for router

      setUser(errorData.user || { email: email.trim() });
      setIsBAARequired(true);
      clearMfaState();

      return { 
        baa_required: true, 
        user: errorData.user,
        error: "Mandatory BAA agreement required." 
      };
    }

    // --- Extract Error Message from API Response ---
    let errorMessage = "Login failed. Please check your credentials and try again.";
    
    if (errorData?.detail) {
      // Handle if detail is an array
      if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.join(" ");
      } 
      // Handle if detail is a string
      else if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      }
    }
    // Handle other error formats (non_field_errors, specific field errors, etc.)
    else if (errorData?.non_field_errors) {
      errorMessage = Array.isArray(errorData.non_field_errors) 
        ? errorData.non_field_errors.join(" ")
        : errorData.non_field_errors;
    }
    else if (errorData?.email || errorData?.password) {
      const errors = [];
      if (errorData.email) errors.push(...(Array.isArray(errorData.email) ? errorData.email : [errorData.email]));
      if (errorData.password) errors.push(...(Array.isArray(errorData.password) ? errorData.password : [errorData.password]));
      errorMessage = errors.join(" ");
    }

    // REMOVED toast.error() from here - let the component handle it

    clearMfaState();
    return { success: false, error: errorMessage };
  }
};

  const signBAA = async (baaFormData) => {
    try {
      const axiosInstance = axiosAuth(); // Uses the temporary BAA access token
      const response = await axiosInstance.put(
        `${API_BASE_URL}/provider/sign-baa/`,
        baaFormData
      );

      const { access, session_id, mfa_required, method, detail } =
        response.data;

      if (!mfa_required || !session_id) {
        throw new Error("BAA signed, but the server failed to initiate MFA.");
      }

      toast.success("BAA signed! Verification code sent.");

      // 1. Clear BAA lock state
      setIsBAARequired(false);
      sessionStorage.removeItem("isBAARequired");

      // 2. Set MFA state for router to redirect to /mfa
      localStorage.setItem("accessToken", access);
      localStorage.setItem("session_id", session_id);
      localStorage.setItem("mfa_method", method || "email");
      setIsMfaPending(true);

      return { success: true, mfa_required: true, detail };
    } catch (error) {
      console.error(
        "❌ Failed to sign BAA:",
        error.response?.data || error.message
      );
      toast.error("Failed to sign BAA. Please log in again.");

      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
      return {
        success: false,
        error: error.response?.data || "Failed to sign BAA",
      };
    }
  };

  // ✅ CRITICAL FIX AREA: Ensuring state is set before returning success
  const verifyCode = async (code) => {
    try {
      const session_id = localStorage.getItem("session_id");
      const accessToken = localStorage.getItem("accessToken");

      if (!session_id || !accessToken) {
        throw new Error("No active MFA session found. Please log in again.");
      }

      const response = await axios.post(
        `${API_BASE_URL}/verify-code/`,
        { code, session_id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { refresh: finalRefreshToken, access: newAccessToken } =
        response.data;

      if (!finalRefreshToken || !newAccessToken) {
        throw new Error("Missing final tokens in verification response.");
      }

      // 1. Final tokens stored
      localStorage.setItem("refreshToken", finalRefreshToken);
      localStorage.setItem("accessToken", newAccessToken);
      clearMfaState();

      // 2. Await full user data fetch and state update (PREVENTS RACE CONDITION)
      await fetchUserData(newAccessToken);

      // 3. Return success only after state is guaranteed to be updated
      return { success: true };
    } catch (error) {
      // Unified error handling block
      console.error(
        "❌ MFA verification error:",
        error.response?.data || error.message
      );

      let errorMessage =
        error.message || "Invalid verification code. Please try again.";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      if (
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        errorMessage.includes("session")
      ) {
        logout();
        return {
          success: false,
          error: "Session expired. Please log in again.",
        };
      }

      // IMPORTANT: If fetchUserData failed, it will also throw/be caught here, and we log out.
      // If we made it past token exchange but fetchUserData failed, the throw inside the try block
      // is caught here, and we'll hit the logout if the error is session-related.

      return { success: false, error: errorMessage };
    }
  };

  const getPatients = async () => {
    try {
      // ✅ Guard against calling before user is ready
      if (!user) {
        console.warn("getPatients called before user authentication completed");
        return { success: false, error: "Authentication not complete" };
      }

      const axiosInstance = axiosAuth();
      const response = await axiosInstance.get("/patients/");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching patients:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Failed to fetch patients",
      };
    }
  };

  const postPatient = async (patientData) => {
    try {
      // ✅ Guard against calling before user is ready
      if (!user) {
        console.warn("postPatient called before user authentication completed");
        return { success: false, error: "Authentication not complete" };
      }

      const axiosInstance = axiosAuth();
      const response = await axiosInstance.post("/patients/", patientData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating patient:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Failed to create patient",
      };
    }
  };

  const updatePatient = async (patientId, patientData) => {
    console.log("🔵 AuthContext.updatePatient called");
    console.log("🔵 patientId:", patientId);
    console.log("🔵 patientData:", patientData);
    console.log("🔵 user:", user);

    try {
      // ✅ Guard against calling before user is ready
      if (!user) {
        console.warn(
          "⚠️ updatePatient called before user authentication completed"
        );
        return { success: false, error: "Authentication not complete" };
      }

      console.log("✅ User authenticated, creating axios instance");
      const axiosInstance = axiosAuth();

      const url = `/patients/${patientId}/`;
      console.log("📤 Making PUT request to:", url);
      console.log("📤 Request payload:", patientData);

      const response = await axiosInstance.put(url, patientData);

      console.log("📥 Response received:", response);
      console.log("📥 Response status:", response.status);
      console.log("📥 Response data:", response.data);

      return { success: true, data: response.data };
    } catch (error) {
      console.error("💥 Error in updatePatient:", error);
      console.error("💥 Error response:", error.response);
      console.error("💥 Error request:", error.request);
      console.error("💥 Error message:", error.message);

      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          error.message ||
          "Failed to update patient",
      };
    }
  };

  const deletePatient = async (patientId) => {
    try {
      // ✅ Guard against calling before user is ready
      if (!user) {
        console.warn(
          "deletePatient called before user authentication completed"
        );
        return { success: false, error: "Authentication not complete" };
      }

      const axiosInstance = axiosAuth();
      await axiosInstance.delete(`/patients/${patientId}/`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting patient:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Failed to delete patient",
      };
    }
  };

  const uploadDocumentAndEmail = async (documentType, files) => {
    try {
      // ✅ Guard against calling before user is ready
      if (!user) {
        console.warn(
          "uploadDocumentAndEmail called before user authentication completed"
        );
        return { success: false, error: "Authentication not complete" };
      }

      const axiosInstance = axiosAuth();
      const formData = new FormData();
      formData.append("document_type", documentType);
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axiosInstance.post(
        "/documents/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error uploading documents:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Failed to upload documents",
      };
    }
  };

  const completeTour = async () => {
  try {
    if (!user) {
      console.warn("completeTour called before user authentication completed");
      return { success: false, error: "Authentication not complete" };
    }

    const axiosInstance = axiosAuth();
    const response = await axiosInstance.put("/provider/complete-tour/");
    
    // Update local user state to reflect tour completion
    setUser(prev => ({
      ...prev,
      has_completed_tour: true,
      tour_completed_at: new Date().toISOString()
    }));
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error marking tour complete:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to complete tour",
    };
  }
};

  // --- Provider Return ---

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isMfaPending,
        isBAARequired,
        register,
        logout,
        login,
        verifyCode,
        signBAA,
        clearMfaState,
        getPatients,
        postPatient,
        updatePatient,
        deletePatient,
        uploadDocumentAndEmail,
        completeTour
      }}
    >
      {/* Renders children only when loading is complete */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
