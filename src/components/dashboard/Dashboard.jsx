import React, { useState, useEffect, useContext } from "react";
import { PropagateLoader } from 'react-spinners';
import OrderManagement from "./orders/OrderManagement";
import Documents from "./documemts/Documents";
import Patients from "./patient/Patient";
import { IoChatbubblesOutline } from "react-icons/io5";
import ContactModal from "../contact/contactModal/ContactModal";
import { AuthContext } from "../../utils/context/auth"; 
import { FilterProvider } from '../../utils/context/FilterContext';
import DashboardTour from "./DashboardTour"; // ✅ IMPORT TOUR
import SalesRepDashboard from "./salesrep/SalesRepDashboard";
import ViewBAAButton from "./ViewBAAButton";
import { IoDocumentTextOutline } from 'react-icons/io5';
import backgroundVideo from "../../assets/videos/vecteezy_brain-circuit-digital-computer-graphic-background-ai_7237608.mp4";


const SPLASH_DURATION = 1000; 
const FADE_OUT_TIME = 500;    

const Dashboard = () => {
  const { user } = useContext(AuthContext); 
  const [openModal, setOpenModal] = useState(false);

  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, SPLASH_DURATION);
    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_DURATION + FADE_OUT_TIME); 
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []); 

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <PropagateLoader color={"#10B981"} loading={true} size={15} />
      </div>
    );
  }

  if (showSplash) {
    return (
      <div 
        className={`
          fixed inset-0 
          bg-teal-200 dark:bg-teal-700 
          z-50 
          flex flex-col items-center justify-center 
          transition-opacity duration-500 ease-in-out
          ${fadeOut ? 'opacity-0' : 'opacity-100'}
        `}
      >
        <div className="text-white text-3xl font-extrabold flex flex-col items-center">
          <h1 className="text-5xl font-bold mb-8 drop-shadow-lg text-white">
            ProMed Health <span className="text-teal-500">Plus</span>
          </h1>
          <div className="mb-10">
            <PropagateLoader 
              color={"#FFFFFF"} 
              loading={true}
              size={15}
              margin={5}
              speedMultiplier={0.8}
            />
          </div>
          <span className="tracking-wider text-xl text-white">Creating Your Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <FilterProvider>
      {/* ✅ ADD TOUR COMPONENT */}
      
      <div className="flex-1 relative min-h-screen pt-24 pb-10 bg-black">

        {/* ✅ Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 ml-[100px]"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        
        {/* ✅ Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60 z-0"></div>
        
        <div className="relative z-10">

            

  {userRole === "provider" ? (
  <>
    <DashboardTour />
    <div className="px-4 sm:px-6 ml-11 font-bold mb-6" data-tour="chat-button">
      <button
        onClick={() => setOpenModal(true)}
        className="
          bg-red-500 text-white 
          py-1.5 px-3 md:py-2 md:px-4 lg:py-3 lg:px-6 
          rounded-full shadow-lg 
          hover:bg-red-600 
          transition duration-300 
          flex items-center text-sm 
          font-semibold
        "
      >
        <IoChatbubblesOutline className="text-lg mr-2" />
        Chat With Your Rep
      </button>
    </div>

    <ContactModal open={openModal} onClose={() => setOpenModal(false)} />

    {/* Main 3-column grid */}
    <div className="px-4 sm:px-6 lg:px-12 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div className="h-full" data-tour="patients-section">
        <Patients /> 
      </div>
      <div className="h-full" data-tour="documents-section">
        <Documents />
      </div>
      <div className="h-full" data-tour="orders-section">
        <OrderManagement />
        
      <div className="h-full">
        <div className="max-w-xl mx-auto mt-9 p-6 bg-white rounded-lg dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-lg">
    
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 h-full w-full">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        BAA Agreement
      </h2>
      <div className="flex flex-col items-center justify-center py-8">
        <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
          <IoDocumentTextOutline className="text-4xl text-purple-600 dark:text-purple-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 text-center">
          View your signed Business Associate Agreement
        </p>
        <ViewBAAButton />
      </div>
    
    </div>
  </div>
    </div>
      </div>
    </div>

    {/* BAA Agreement Card - Below the grid */}
    
  </>
): userRole === "sales_rep" ? (
          <SalesRepDashboard user={user} />
        ) : userRole === "admin" || userRole === "ceo" ? (
          <div className="text-center px-6 py-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Admin Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Advanced admin features coming soon!
            </p>
            <div className="inline-flex items-center space-x-2 text-teal-600 dark:text-teal-400">
              <span className="animate-pulse">⚡</span>
              <span className="font-semibold">In Development</span>
              <span className="animate-pulse">⚡</span>
            </div>
          </div>
        ): (
          <div className="text-center px-6 py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Unknown Role: {userRole || "No Role Found"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please contact support if this issue persists.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout & Try Again
            </button>
          </div>
        )}
        
        {/* ✅ ADD data-tour ATTRIBUTE */}
        
      </div>
      </div>
    </FilterProvider>
  );
};

export default Dashboard;