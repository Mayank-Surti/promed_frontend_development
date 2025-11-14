// src/components/verify-email/VerifyEmail.js

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ⬅️ Import useNavigate
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";
import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from "react-icons/io5";

const VerifyEmail = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const navigate = useNavigate(); // ⬅️ Initialize navigate
  const hasVerified = useRef(false);
  useEffect(() => {
    const verifyToken = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;
      try {
        // Make the GET request to your backend's verification endpoint
        await axios.get(`${API_BASE_URL}/provider/verify-email/${token}/`);
        setVerificationStatus("success");
      } catch (error) {
        setVerificationStatus("error");
        console.error("Email verification failed:", error);
        console.error("Email verification failed:", error.response?.data || error);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleRedirectToLogin = () => {
    // ⬅️ Add a handler to navigate to the login page
    navigate("/login"); 
  };

  const renderContent = () => {
    if (verificationStatus === "verifying") {
      return (
        <p className="text-xl">Verifying your email address...</p>
      );
    } else if (verificationStatus === "success") {
      return (
        <div className="text-center">
          <IoCheckmarkCircleOutline className="text-purple-500 mx-auto text-6xl mb-4" />
          <h2 className="text-2xl font-bold">Email Verified!</h2>
          <p className="mt-2 text-gray-600">You can now log in to your account.</p>
          <button
            onClick={handleRedirectToLogin} // ⬅️ Call the handler on click
            className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-md"
          >
            Go to Login
          </button>
        </div>
      );
    } else {
      return (
        <div className="text-center">
          <IoCloseCircleOutline className="text-red-500 mx-auto text-6xl mb-4" />
          <h2 className="text-2xl font-bold">Verification Failed</h2>
          <p className="mt-2 text-gray-600">The link is invalid or has expired.</p>
          <button
            onClick={() => navigate("/register")}
            className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-md"
          >
            Register Again
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-teal-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmail;