import React, { useEffect, useContext, useRef, useState } from "react";
import {
  HashRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { PropagateLoader } from "react-spinners";

// Component Imports
import Dashboard from "./components/dashboard/Dashboard";
import SalesRepDashboard from "./components/salesRepDashboard/SalesRepDashboard";
import Register from "./components/register/Register";
import Login from "./components/login/Login";
import Navbar from "./components/navbar/Navbar";
import About from "./components/about/About";
import Products from "./components/products/Products";
import Contact from "./components/contact/Contact";
import MFA from "./components/MFA/MFA";
import Home from "./components/home/Home";
import Footer from "./components/footer/Footer";
import ProviderProfileCard from "./components/profile/ProviderProfileCard";
import VerifyEmail from "./components/verifyEmail/VerifyEmail";
import ForgotPassword from "./components/login/ForgotPassword";
import ResetPassword from "./components/login/ResetPassword";
import BAAAgreementPage from "./components/login/BAAAgreementPage";

// Utility Imports
// 🔑 AuthProvider is imported correctly here
import { AuthContext, AuthProvider } from "./utils/context/auth";

import "./App.css";

// Helper function for route classification
const isPublicRoute = (path) =>
  path === "/" ||
  path === "/register" ||
  path === "/about" ||
  path === "/products" ||
  path === "/contact" ||
  path.startsWith("/verify-email") ||
  path.startsWith("/reset-password") ||
  path === "/forgot-password";

const isAuthRoute = (path) =>
  path === "/login" || path === "/mfa" || path === "/baa-agreement";
const isSecuredRoute = (path) =>
  path === "/dashboard" ||
  path === "/sales-rep/dashboard" ||
  path === "/profile";

function AppWrapper() {
  const location = useLocation();

  // 🔑 CHANGE 1: Destructure isBAARequired from context
  const {
    logout,
    user,
    loading: authLoading,
    isMfaPending,
    isBAARequired, // <-- ADDED THIS CRITICAL STATE
  } = useContext(AuthContext);

  const warningTimeoutRef = useRef(null);
  const logoutTimeoutRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const hiddenPaths = [
    "/login",
    "/register",
    "/mfa",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/baa-agreement", // Added BAA screen to hide nav/footer
  ];
  const shouldHideNavAndFooter = hiddenPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  // 1. Dark Mode Initialization (remains the same)
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");

    const isDark = savedMode === null ? true : savedMode === "true";
    
    setIsDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // 2. Session Timeout Logic (remains the same)
  useEffect(() => {
    if (!user) return;

    const HIPAA_IDLE_TIMEOUT_MINUTES = 15;
    const WARNING_BEFORE_LOGOUT_SECONDS = 60;

    const warningDuration =
      1000 * 60 * HIPAA_IDLE_TIMEOUT_MINUTES -
      1000 * WARNING_BEFORE_LOGOUT_SECONDS;
    const logoutDuration = 1000 * 60 * HIPAA_IDLE_TIMEOUT_MINUTES;

    const logoutAndRedirect = () => {
      logout();
      toast.error("Logged out due to inactivity.", { id: "logout-toast" });
      setTimeout(() => {
        window.location.replace("/login");
      }, 0);
    };

    const showWarning = () => {
      toast("You will be logged out in 1 minute due to inactivity.", {
        icon: "⚠️",
        duration: WARNING_BEFORE_LOGOUT_SECONDS * 1000,
        id: "logout-toast",
      });
    };

    const resetTimers = () => {
      clearTimeout(warningTimeoutRef.current);
      clearTimeout(logoutTimeoutRef.current);
      toast.dismiss("logout-toast");

      warningTimeoutRef.current = setTimeout(showWarning, warningDuration);
      logoutTimeoutRef.current = setTimeout(logoutAndRedirect, logoutDuration);
    };

    resetTimers();

    const activityEvents = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((event) =>
      window.addEventListener(event, resetTimers)
    );

    return () => {
      clearTimeout(warningTimeoutRef.current);
      clearTimeout(logoutTimeoutRef.current);
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimers)
      );
    };
  }, [logout, user]);

  // 3. Global Auth Loading Check
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <PropagateLoader
          color={isDarkMode ? "#00A389" : "#10B981"}
          loading={true}
          size={15}
        />
      </div>
    );
  }

  // 🔑 4. CRITICAL ROUTING GUARD LOGIC

  // 🛑 Rule A: BAA must be signed. This is the highest priority lock.
  if (isBAARequired && location.pathname !== "/baa-agreement") {
    return <Navigate to="/baa-agreement" replace />;
  }

  // 🔒 Rule B: Pending MFA must be on the MFA screen.
  if (isMfaPending && location.pathname !== "/mfa") {
    return <Navigate to="/mfa" replace />;
  }

  // Rule C: Logged-in users WITHOUT pending states can access secured routes
  // ✅ CRITICAL FIX: Add checks for !isBAARequired && !isMfaPending
  if (user && !isBAARequired && !isMfaPending) {
    if (isAuthRoute(location.pathname) || isPublicRoute(location.pathname)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Rule D: Unauthenticated users are blocked from secured routes.
  if (!user && !isMfaPending && !isBAARequired) {
    if (isSecuredRoute(location.pathname)) {
      return <Navigate to="/login" replace />;
    }
  }

  return (
    <>
      <Toaster />
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col min-h-screen transition-colors duration-300">
        {/* Navbar */}
        {!shouldHideNavAndFooter && (
          <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        )}

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth/Lock Routes - Must be outside the secured routes check */}
            <Route path="/baa-agreement" element={<BAAAgreementPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mfa" element={<MFA />} />

            {/* Private Routes (Secured) */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/sales-rep/dashboard"
              element={<SalesRepDashboard />}
            />
            <Route path="/profile" element={<ProviderProfileCard />} />
          </Routes>
        </main>

        {/* Footer */}
        {!shouldHideNavAndFooter && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <HashRouter>
      {/* The AuthProvider must wrap the router and the AppWrapper */}
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
