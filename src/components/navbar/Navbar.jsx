import React, { useState, useEffect, useRef, useContext } from "react";
import default_user_img from "../../assets/images/default_user.jpg";
import { IoIosNotificationsOutline } from "react-icons/io";
import { IoEyeOutline } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { Link } from "react-router-dom";
import { AuthContext } from "../../utils/context/auth";
import NotificationModal from "./NotificationModal";
import axiosAuth from "../../utils/axios";
import logo from "../../assets/images/logo.png";
import { PiSignIn } from "react-icons/pi";
import { MdAppRegistration } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { TbUsersGroup } from "react-icons/tb";
import { AiOutlineProduct } from "react-icons/ai";
import { MdOutlineContactPhone } from "react-icons/md";

const MobileMenuIconSVG = () => (
  <svg
    className="block h-5 w-5 fill-current text-teal-500 transition-transform duration-300 hover:scale-110"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Mobile menu</title>
    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
  </svg>
);

const CloseMenuIconSVG = () => (
  <svg
    className="h-6 w-6 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-all duration-300 hover:rotate-90"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    ></path>
  </svg>
);

const Navbar = ({ isDarkMode, setIsDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notificationRef = useRef(null);

  // ✅ FIX: Destructure 'loading' from AuthContext
  const { user, logout, loading: authLoading } = useContext(AuthContext);

  // isAuthenticated is true ONLY if user object exists AND is loaded
  const isAuthenticated = !!user && !authLoading;

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    if (newMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  // --- External Click Handlers and Scroll/Resize Hooks (No change) ---
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        closeMobileMenu();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // ------------------------------------------------------------------

  // --- Notification Fetch Hook (Only run if user is loaded) ---
  useEffect(() => {
    const fetchNotifications = async () => {
      // ✅ FIX: Added check for profile existence before fetching
      if (!user) return;

      try {
        const axiosInstance = axiosAuth();
        const [notifRes, countRes] = await Promise.all([
          axiosInstance.get("/notifications/"),
          axiosInstance.get("/notifications/unread-count/"),
        ]);

        setNotifications(notifRes.data);
        setNotificationCount(countRes.data.unread_count || 0);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    if (isAuthenticated) {
      // Will only run if user is loaded AND token is present
      fetchNotifications();
    }
  }, [isAuthenticated, user]); // Added 'user' as dependency for robustness

  function removeDuplicateMedia(url) {
    if (url && typeof url === "string") {
      const duplicatedSegment = "media/images/";
      if (url.includes(duplicatedSegment)) {
        return url.replace(duplicatedSegment, "images/");
      }
    }
    return url;
  }

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    markAsRead(notification.id);
    setShowDropdown(false);
    closeMobileMenu();
  };

  const markAsRead = async (id) => {
    try {
      const axiosInstance = axiosAuth();
      await axiosInstance.patch(`/${id}/mark-read/`);
      setNotificationCount((prev) => Math.max(prev - 1, 0));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const axiosInstance = axiosAuth();
      await axiosInstance.delete(`/${id}/delete-notification/`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setShowModal(false);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  function getTimeLabel(dateCreated) {
    const now = new Date();
    const created = new Date(dateCreated);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    if (diffDays < 21) return "2 weeks ago";
    if (diffDays < 30) return "3 weeks ago";
    return "More than 30 days ago";
  }

  const profile = user; // Alias for cleaner access

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <nav className="relative px-6 sm:px-8 py-4 flex justify-between items-center w-full mx-auto">
        {/* Logo Section (Far Left - No change) */}
        <div className="flex items-center flex-shrink-0 group">
          <img
            src={logo}
            alt=""
            width={50}
            height={50}
            className="mr-2 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          />
          <div className="flex flex-col leading-tight">
            <Link
              className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-teal-600 to-teal-500 dark:from-gray-100 dark:via-teal-400 dark:to-teal-300 bg-clip-text text-transparent whitespace-nowrap transition-all duration-300 hover:tracking-wide"
              to="/"
            >
              ProMed Health{" "}
              <span className="text-teal-500 dark:text-teal-400">Plus</span>
            </Link>
            <span className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5">
              v1.0.0 • Beta Release
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links (Middle - No change) */}
        <div className="hidden lg:flex items-center justify-center flex-1">
          <ul className="flex items-center space-x-8 xl:space-x-10">
            {[
         
              // ✅ FIX: Use simple isAuthenticated check, as loading is handled in parent
              ...(isAuthenticated
                ? [{ to: "/dashboard/", label: "Dashboard" }]
                : []),
              { to: "/about/", label: "About Us" },
              { to: "/products/", label: "Products" },
              { to: "/contact/", label: "Contact" },
            ].map((item) => (
              <li key={item.to} className="relative group">
                <Link
                  className="text-base text-gray-700 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 font-semibold whitespace-nowrap transition-all duration-300 py-2"
                  to={item.to}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side Content/Button Group (Far Right) */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Mobile menu button (No change) */}
          <div className="lg:hidden">
            <button
              className="navbar-burger flex items-center p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-300"
              onClick={toggleMobileMenu}
            >
              <MobileMenuIconSVG />
            </button>
          </div>

          {/* Desktop Right Side - Conditional Rendering */}
          {authLoading ? (
            // Show a loading state if the initial context check is running
            <div className="hidden lg:flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ) : isAuthenticated ? (
            // ✅ Authenticated UI (Only renders if user data is loaded)
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle Dark Mode"
                className="p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:shadow-lg transform hover:scale-110 transition-all duration-300 flex-shrink-0 group"
              >
                {isDarkMode ? (
                  <MdLightMode
                    size={22}
                    className="text-yellow-500 group-hover:rotate-180 transition-transform duration-500"
                  />
                ) : (
                  <MdDarkMode
                    size={22}
                    className="text-teal-600 group-hover:-rotate-180 transition-transform duration-500"
                  />
                )}
              </button>

              {/* Notification Dropdown (No changes needed, relies on isAuthenticated) */}
              <div
                className="relative notification-container flex-shrink-0"
                ref={notificationRef}
              >
                {/* ... Notification button and dropdown content ... */}
                <button className="p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:shadow-lg transform hover:scale-110 transition-all duration-300 relative">
                  <IoIosNotificationsOutline
                    className="text-2xl text-gray-600 dark:text-gray-300 cursor-pointer"
                    onClick={() => setShowDropdown((prev) => !prev)}
                  />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                      {notificationCount}
                    </span>
                  )}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-slideDown">
                    <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        Notifications
                      </h3>
                    </div>
                    <ul className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <li
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`px-4 py-3 flex flex-col border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-all duration-300 ${
                              notif.is_read
                                ? "bg-gray-50 dark:bg-gray-800/50 text-gray-400"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                            } cursor-pointer hover:shadow-md`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-sm flex-1">
                                {notif.message}
                              </span>
                              {notif.data && (
                                <IoEyeOutline className="text-teal-500 text-lg ml-2 flex-shrink-0 hover:scale-125 transition-transform duration-300" />
                              )}
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                              {getTimeLabel(notif.date_created)}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
                          No notifications yet
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div
                className="relative flex-shrink-0"
                onClick={() => setShowProfileDropdown(true)}
                ref={profileRef}
                data-tour="profile-menu"
              >
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <h6 className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap hidden xl:block group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors duration-300">
                    {/* ✅ FIX: Use optional chaining to prevent crash if 'profile' is momentarily null/undefined */}
                    {profile?.full_name || profile?.email || "User"}
                  </h6>
                  <div className="relative">
                    <img
                      // ✅ FIX: Use optional chaining on 'profile' and image path
                      src={
                        profile?.image?.startsWith("http")
                          ? removeDuplicateMedia(profile.image)
                          : profile?.image
                          ? `${process.env.REACT_APP_MEDIA_URL}${profile.image}`
                          : default_user_img
                      }
                      alt="User Profile"
                      className="w-11 h-11 rounded-full object-cover object-top border-2 border-teal-500/50 dark:border-teal-400/50 shadow-lg group-hover:border-teal-500 dark:group-hover:border-teal-400 group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                  </div>
                </div>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-slideDown">
                    <div className="p-3 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                        {/* ✅ FIX: Use optional chaining */}
                        {profile?.full_name || profile?.email || "User"}
                      </p>
                    </div>
                    {/* ... Logout and Profile links (No change) ... */}
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer font-medium transition-all duration-300 group"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <IoEyeOutline className="mr-3 text-lg group-hover:scale-125 transition-transform duration-300" />
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer font-medium transition-all duration-300 group"
                    >
                      <IoMdLogOut className="mr-3 text-lg group-hover:scale-125 transition-transform duration-300" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Desktop Right Side - Unauthenticated */
            <div className="hidden lg:flex items-center space-x-4">
              {/* ... Unauthenticated buttons (No change) ... */}
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle Dark Mode"
                className="p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:shadow-lg transform hover:scale-110 transition-all duration-300 flex-shrink-0 group"
              >
                {isDarkMode ? (
                  <MdLightMode
                    size={22}
                    className="text-yellow-500 group-hover:rotate-180 transition-transform duration-500"
                  />
                ) : (
                  <MdDarkMode
                    size={22}
                    className="text-teal-600 group-hover:-rotate-180 transition-transform duration-500"
                  />
                )}
              </button>
              <Link to="/login">
                <button className="px-6 py-2.5 text-sm font-bold tracking-wide text-white bg-gradient-to-r from-teal-600 to-teal-500 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 uppercase whitespace-nowrap flex justify-center items-center">
                  <PiSignIn className="mr-1 font-bold" /> Dashboard Login
                </button>
              </Link>
              <Link to="/register">
                <button className="px-6 py-2.5 text-sm font-bold tracking-wide text-teal-600 dark:text-teal-400 border-2 border-teal-500 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transform hover:scale-105 transition-all duration-300 uppercase whitespace-nowrap flex justify-center items-center">
                  <MdAppRegistration className="mr-1 font-bold" /> Provider
                  Registration
                </button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`navbar-menu fixed inset-0 z-50 ${
          isMobileMenuOpen ? "" : "pointer-events-none"
        }`}
      >
        {/* Backdrop and Sliding menu panel (No significant changes) */}
        <div
          className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-500 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobileMenu}
        ></div>

        <nav
          className={`fixed top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 bg-white dark:bg-gray-900 overflow-y-auto transform transition-all duration-500 ease-out z-50 shadow-2xl ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header and Links (No change) */}
          <div className="flex items-center mb-6 justify-between">
            <div className="flex items-center">
              <img
                src={logo}
                alt=""
                height={50}
                width={50}
                className="animate-pulse"
              />
              <div className="ml-2 flex flex-col leading-tight">
                <Link
                  className="text-xl font-bold leading-none bg-gradient-to-r from-gray-900 via-teal-600 to-teal-500 dark:from-gray-100 dark:via-teal-400 dark:to-teal-300 bg-clip-text text-transparent"
                  to="/"
                >
                  ProMed Health{" "}
                  <span className="text-teal-500 dark:text-teal-400">Plus</span>
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5">
                  v1.0.0 • Beta Release
                </span>
              </div>
            </div>

            <button className="navbar-close" onClick={closeMobileMenu}>
              <CloseMenuIconSVG />
            </button>
          </div>
          <ul className="space-y-1 flex flex-col items-start">
            {[
              { to: "/", label: "Home", icon: <IoHomeOutline className="mr-1 font-bold" /> },
              // ✅ FIX: Use simple isAuthenticated check
              ...(isAuthenticated
                ? [
                    { to: "/dashboard/", label: "Dashboard" },
                    { to: "/profile", label: "Profile" },
                  ]
                : []),
              { to: "/about/", label: "About Us", icon: <TbUsersGroup className="mr-1 font-bold" /> },
              {
                to: "/products/",
                label: "Products",
                icon: <AiOutlineProduct className="mr-1 font-bold"/>,
              },
              {
                to: "/contact/",
                label: "Contact",
                icon: <MdOutlineContactPhone className="mr-1 font-bold"/>,
              },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  className="flex justify-start items-center px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-100 dark:hover:from-teal-900/30 dark:hover:to-teal-800/30 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl transition-all duration-300 transform hover:translate-x-2"
                  to={item.to}
                  onClick={closeMobileMenu}
                >
                  {item.icon} {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Authenticated Status (Only display if profile is loaded) */}
          {isAuthenticated && (
            <div className="flex items-center space-x-4 mt-6 p-4 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 rounded-2xl">
              <div className="relative">
                <img
                  // ✅ FIX: Use optional chaining
                  src={
                    profile?.image?.startsWith("http")
                      ? removeDuplicateMedia(profile.image)
                      : profile?.image
                      ? `${process.env.REACT_APP_MEDIA_URL}${profile.image}`
                      : default_user_img
                  }
                  alt="User Profile"
                  className="w-12 h-12 rounded-full object-cover object-top border-2 border-teal-500 dark:border-teal-400 shadow-lg"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
              </div>
              <h6 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex-1 truncate">
                {/* ✅ FIX: Use optional chaining */}
                {profile?.full_name || profile?.email || "User"}
              </h6>
            </div>
          )}

          {/* Mobile Bottom Buttons */}
          <div className="mt-auto pt-6 flex flex-col space-y-3">
            {isAuthenticated ? (
              // Mobile Authenticated Buttons (No change, relies on profile being present)
              <>
                {/* ... Notifications, Dark Mode, Logout Buttons ... */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown((prev) => !prev)}
                    className="w-full px-4 py-3 text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                  >
                    <IoIosNotificationsOutline className="text-xl mr-2" />
                    Notifications
                    {notificationCount > 0 && (
                      <span className="ml-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                  {showDropdown && (
                    <div className="mt-3 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-slideDown">
                      <div className="p-3 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          Notifications
                        </h3>
                      </div>
                      <ul className="max-h-60 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <li
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`px-4 py-3 flex flex-col border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                                notif.is_read
                                  ? "bg-gray-50 dark:bg-gray-800/50 text-gray-400"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                              } cursor-pointer transition-all duration-300`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-sm flex-1">
                                  {notif.message}
                                </span>
                                {notif.data && (
                                  <IoEyeOutline className="text-teal-500 text-lg ml-2 flex-shrink-0" />
                                )}
                              </div>
                              <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                                {getTimeLabel(notif.date_created)}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
                            No notifications yet
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleDarkMode}
                  aria-label="Toggle Dark Mode"
                  className="w-full px-4 py-3 text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                >
                  {isDarkMode ? (
                    <MdLightMode size={20} className="text-yellow-500 mr-2" />
                  ) : (
                    <MdDarkMode size={20} className="text-teal-600 mr-2" />
                  )}
                  Toggle Dark Mode
                </button>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="w-full px-4 py-3 text-sm font-bold tracking-wide text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              // Mobile Unauthenticated Buttons (No change)
              <>
                <button
                  onClick={toggleDarkMode}
                  aria-label="Toggle Dark Mode"
                  className="w-full px-4 py-3 text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                >
                  {isDarkMode ? (
                    <MdLightMode size={20} className="text-yellow-500 mr-2" />
                  ) : (
                    <MdDarkMode size={20} className="text-teal-600 mr-2" />
                  )}
                  Toggle Dark Mode
                </button>
                <Link to="/login" onClick={closeMobileMenu}>
                  <button className="w-full px-4 py-3 text-sm font-bold tracking-wide text-white bg-gradient-to-r from-teal-600 to-teal-500 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 uppercase flex justify-center items-center">
                    <PiSignIn className="mr-1 font-bold" /> Dashboard Login
                  </button>
                </Link>
                <Link to="/register" onClick={closeMobileMenu}>
                  <button className="w-full px-4 py-3 text-sm font-bold tracking-wide text-teal-600 dark:text-teal-400 border-2 border-teal-500 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transform hover:scale-105 transition-all duration-300 uppercase flex justify-center items-center">
                    <MdAppRegistration className="mr-1 font-bold" /> Provider
                    Registration
                  </button>
                </Link>
              </>
            )}
          </div>

          <p className="mt-6 text-xs text-center text-gray-400 dark:text-gray-500 font-medium">
            ProMed Health Plus &copy; {new Date().getFullYear()}
          </p>
        </nav>
      </div>

      <NotificationModal
        open={showModal}
        handleClose={() => setShowModal(false)}
        notification={selectedNotification}
        handleDelete={deleteNotification}
      />

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
