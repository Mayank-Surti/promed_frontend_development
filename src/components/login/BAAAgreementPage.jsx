import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from "../../utils/context/auth"; 
import BAAForm from './BAAForm';
import { motion } from "framer-motion"; // 1. Import motion
import axios from 'axios';

const API_BASE_URL = "http://localhost:8000/api/v1";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 50, damping: 20, delay: 0.1 }
  }
};

const BAAAgreementPage = () => {
  const { signBAA, user, isBAARequired,  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const fetchProfileData = async () => {
    // ✅ Get token from localStorage instead of authTokens
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/provider/profile/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      console.log("🔍 Full API Response:", response.data);
  console.log("🔍 User object:", response.data.user);
  console.log("🔍 Facility from profile:", response.data.facility);
  console.log("🔍 Facility from user:", response.data.user?.facility);
  console.log("🔍 Title from profile:", response.data.title);
  console.log("🔍 Title from user:", response.data.user?.title);
      
      // ✅ Extract user data from nested structure
      const userData = {
        full_name: response.data.user?.full_name || '',
        facility: response.data.facility || '',
        title: response.data.title || '', // title comes from Profile model
        email: response.data.user?.email || '',
      };
      
      setProfileData(userData);
      console.log("✅ Profile data fetched:", userData);
    } catch (error) {
      console.error("❌ Failed to fetch profile data:", error);
      // Even if profile fetch fails, we can still use basic user data
      setProfileData({
        full_name: user?.full_name || user?.email || '',
        facility: user?.facility || '',
        title: user?.title || '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  fetchProfileData();
}, [user]); // ✅ Only depend on user, not authTokens
  if (!isBAARequired) {
    if (user) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  const handleAgreementAccepted = async (formData) => {
    const result = await signBAA(formData);
    if (result.success && result.mfa_required) navigate('/mfa', { replace: true });
    else if (result.success) navigate('/dashboard', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const prefillData = {
    full_name: user?.full_name || user?.email || '',
    facility: user?.facility || user?.company_name || '',
    title: user?.title || '',
  };

  return (
    // 2. Add dark background and animation classes
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-6">
      
      {/* 3. Animated background elements (Copied from ForgotPasswordPage) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content / Form Container */}
      <motion.div
        className="relative z-10 w-full max-w-3xl" // Removed extra padding since the outer div has it
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
          <h1 className="text-3xl font-bold mb-3 text-center text-white">
            Business Associate Agreement (BAA) Acceptance
          </h1>
          <p className="text-center mb-6 text-gray-300">
            To continue, please review and accept the Business Associate Agreement.
          </p>
          <BAAForm 
            onAgreementAccepted={handleAgreementAccepted} 
            userData={profileData}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default BAAAgreementPage;