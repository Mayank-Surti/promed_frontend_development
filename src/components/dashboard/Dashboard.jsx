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

const SPLASH_DURATION = 1000; 
const FADE_OUT_TIME = 500;    

const Dashboard = () => {
  const { user } = useContext(AuthContext); 
  const [openModal, setOpenModal] = useState(false);

  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

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
      <DashboardTour />
      
      <div className="flex-1 bg-gradient-to-t from-white via-teal-100 to-white 
                    dark:from-gray-900 dark:via-teal-950 dark:to-gray-900 pt-24">
        
        {/* ✅ ADD data-tour ATTRIBUTE */}
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

        <div className="px-4 sm:px-6 lg:px-12 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* ✅ ADD data-tour ATTRIBUTES */}
          <div className="h-full" data-tour="patients-section">
            <Patients /> 
          </div>
          <div className="h-full" data-tour="documents-section">
            <Documents />
          </div>
          <div className="h-full" data-tour="orders-section">
            <OrderManagement />
          </div>
        </div>
      </div>
    </FilterProvider>
  );
};

export default Dashboard;