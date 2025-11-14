import React, { useState, useContext } from "react";
import { AuthContext } from "../../utils/context/auth";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoArrowBack, IoMail, IoLockClosed, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import login_bg_img_2 from "../../assets/images/login_bg.jpg";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [method, setMethod] = useState("email"); // ✅ Changed default to 'email'
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const result = await login(email, password, method);

    // ✅ ADDED: Handle BAA Required response
    if (result.baa_required) {
      console.log("🔒 BAA signature required - redirecting to /baa-agreement");
      navigate("/baa-agreement");
    } 
    // Handle MFA Required response
    else if (result.mfa_required) {
      console.log("🔐 MFA required - redirecting to /mfa");
      navigate("/mfa", { state: { session_id: result.session_id, email } });
    } 
    // Handle successful login (no BAA/MFA required - shouldn't happen in your setup)
    else if (result.success) {
      console.log("✅ Login successful - redirecting to /dashboard");
      navigate("/dashboard");
    } 
    // Handle errors
    else {
      let displayError = "An unknown error occurred.";
      if (typeof result.error === 'object' && result.error !== null) {
        const firstKey = Object.keys(result.error)[0];
        displayError = result.error[firstKey] && Array.isArray(result.error[firstKey])
          ? `${firstKey}: ${result.error[firstKey][0]}`
          : JSON.stringify(result.error);
      } else if (typeof result.error === 'string') {
        displayError = result.error;
        toast.error(displayError);
      }
      setErrorMsg(displayError);
    }

    setIsLoading(false);
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

  const imageVariants = {
    hidden: { scale: 1.2, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 1.2, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-6 left-6 z-50"
        >
          <Link
            to="/"
            className="group flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full shadow-xl transition-all duration-300 border border-white/20"
            title="Back to Home"
          >
            <IoArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Left Panel - Image */}
        <motion.div
          className="hidden lg:flex lg:w-3/5 relative"
          initial="hidden"
          animate="visible"
          variants={imageVariants}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${login_bg_img_2})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>

          <div className="relative z-10 flex items-center px-16 xl:px-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="max-w-xl"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-16 bg-gradient-to-b from-teal-400 to-blue-500 rounded-full"></div>
                  <h1 className="text-6xl font-semibold text-white">
                    ProMed Health
                    <span className="block text-teal-400">
                      Plus
                    </span>
                  </h1>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-xl text-gray-300 leading-relaxed font-light"
              >
                Improving Patient Outcomes with Proven Wound Care Solutions
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="mt-12 flex gap-4"
              >
                {["Trusted", "Innovative", "Comprehensive"].map((item, idx) => (
                  <div key={idx} className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                    <span className="text-teal-400 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            className="w-full max-w-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center mb-10">
              <h2 className="text-4xl font-bold text-white mb-3">
                Welcome Back
              </h2>
              <p className="text-gray-400 text-lg">
                Sign in to access your dashboard
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10"
            >
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Input */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IoMail className="text-gray-400 group-focus-within:text-teal-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300"
                      required
                    />
                  </div>
                </motion.div>

                {/* Password Input */}
                <motion.div variants={itemVariants}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IoLockClosed className="text-gray-400 group-focus-within:text-teal-400 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-teal-400 transition-colors"
                    >
                      {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                  </div>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
                    >
                      <p className="text-red-400 text-sm">{errorMsg}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </motion.button>
              </form>

              {/* Register Link */}
              <motion.div variants={itemVariants} className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
              </motion.div>
            </motion.div>

            {/* Security Badge & EMR Notice */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col items-center gap-3"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <svg className="w-4 h-4 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-400 font-medium">Secured by 256-bit encryption</span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg"
              >
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-xs text-gray-300">
                  <span className="font-semibold text-amber-400">EMR/EHR </span> integrations coming soon
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;