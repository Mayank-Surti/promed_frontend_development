import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../../utils/context/auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import mfa_bg_img_2 from '../../assets/images/mfa_img.jpg';

const MFA = () => {
  const { verifyCode, user } = useContext(AuthContext);
  const [code, setCode] = useState(new Array(6).fill(""));
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.verified) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (value, index) => {
    if (/^\d$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setCode(newCode);
      const nextIndex = Math.min(pastedData.length, 5);
      inputsRef.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    const fullCode = code.join("");

    try {
      const response = await verifyCode(fullCode);
      if (response.success) {
        setVerified(true);
        setTimeout(() => navigate("/dashboard"), 1500);
        setError(null);
      } else {
        setError(response.error || "Verification failed. Please try again.");
        setCode(new Array(6).fill(""));
        inputsRef.current[0]?.focus();
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred. Please try again.");
      setCode(new Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Panel */}
        <motion.div
          className="hidden lg:flex lg:w-3/5 relative"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${mfa_bg_img_2})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>

          <div className="relative z-10 flex items-center px-16 xl:px-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-xl"
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-16 bg-gradient-to-b from-teal-400 to-blue-500 rounded-full"></div>
                  <h1 className="text-6xl font-semibold text-white">
                    ProMed Health
                    <span className="block text-teal-400">
                       Plus
                    </span>
                  </h1>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-6"
              >
                <p className="text-xl text-gray-300 leading-relaxed">
                  We sent a secure code to your registered device for identity verification.
                </p>

                <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Enhanced Security</p>
                    <p className="text-gray-400 text-sm">Your account is protected by two-factor authentication</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Panel - MFA Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            className="w-full max-w-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-full mb-6 border-4 border-white/10">
                <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-white mb-3">
                Verify Your Identity
              </h2>
              <p className="text-gray-400 text-lg">
                Enter the 6-digit code sent to your email
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {!verified ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10"
                >
                  <form onSubmit={handleSubmit}>
                    <motion.div variants={itemVariants} className="mb-8">
                      <div className="flex justify-center gap-3">
                        {code.map((digit, index) => (
                          <motion.input
                            key={index}
                            ref={(el) => (inputsRef.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                            className="w-14 h-16 text-center text-3xl font-bold bg-white/5 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileFocus={{ scale: 1.05 }}
                          />
                        ))}
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
                        >
                          <p className="text-red-400 text-sm text-center">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      variants={itemVariants}
                      type="submit"
                      disabled={code.some(d => d === "") || isVerifying}
                      className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isVerifying ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Verifying...
                          </>
                        ) : (
                          "Verify Code"
                        )}
                      </span>
                      <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    </motion.button>

                    <motion.div variants={itemVariants} className="mt-6 text-center">
                      <button
                        type="button"
                        className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
                      >
                        Didn't receive a code? <span className="font-semibold">Resend</span>
                      </button>
                    </motion.div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 shadow-2xl border border-white/10 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full mb-6"
                  >
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-3">
                    Verification Successful!
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Redirecting you to your dashboard...
                  </p>
                  <div className="flex justify-center">
                    <div className="w-16 h-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Security Info */}
            <motion.div variants={itemVariants} className="mt-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-300 font-medium mb-1">Secure Authentication</p>
                    <p className="text-xs text-gray-500">This code expires in 5 minutes for your security</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MFA;