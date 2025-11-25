import React, { useState } from "react";
import { Modal, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion"; // Make sure AnimatePresence is available if using modal exit transition
import { IoMailOutline, IoCallOutline } from "react-icons/io5";
import { states, about_approach_data, about_team } from "../../utils/data";
import FloatingParticles from "../home/FloatingParticles"
import about_bg_img from '../../assets/images/about_bg_img.jpg';

import toast from 'react-hot-toast'; 
import axios from "axios"; 

const MotionBox = motion(Box);

const About = () => {
  const [open, setOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const [formData, setFormData] = useState({
    name: "",
    facility: "", 
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    question: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
        name: "",
        facility: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        email: "",
        question: "",
    });
  };
  
  // ✅ UPDATED: handleSubmit function for API call and validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { name, email, phone, question, facility, city, state, zip } = formData;
    
    // Validation
    if (!name || !facility || !city || !state || !zip || !phone || !email || !question) {
        toast.error("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address.");
        setIsSubmitting(false);
        return;
    }

    try {
      // API Call to your Django endpoint
      await axios.post(
        'http://localhost:8000/api/v1/contact-us/',
        formData
      );
      
      toast.success("Your message has been sent. We'll get back to you soon!");
      
      handleClose(); // Close modal on success
      resetForm();   // Clear the form
    } catch (error) {
      console.error(
        "Failed to send message:",
        error.response?.data || error.message
      );
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // END UPDATED handleSubmit

  const handleClose = () => {
    setOpen(false);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" },
    visible: {
      opacity: 1,
      scale: 1,
      x: "-50%", 
      y: "-50%", 
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      x: "-50%", 
      y: "-50%",
      transition: {
        duration: 0.2,
      },
    },
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "100%",
    maxWidth: 600,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "none",
    outline: "none",
    bgcolor: 'transparent', 
  };

  const darkModeClass = isDarkMode ? "dark" : "";

  // --- Framer Motion Animation Variants for Main Content ---

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className={darkModeClass}>
      <div className="bg-white dark:bg-gray-900 transition-colors duration-500 min-h-screen">
        
        <FloatingParticles />
        
        {/* ... (Hero Section content remains the same) ... */}
        <motion.header
          className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white pt-32 pb-16 transition-colors duration-500"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold"
              variants={itemVariants}
            >
              About Promed Health <span className="text-teal-500">Plus</span>
            </motion.h1>
            <motion.p
              className="text-lg sm:text-2xl mt-4 max-w-4xl mx-auto opacity-90 text-gray-600 dark:text-gray-300 font-semibold"
              variants={itemVariants}
            >
              {''}Built For The Next Generation Of Care...
            </motion.p>
          </div>
        </motion.header>

        {/* Main Section */}
        <main className="container mx-auto px-4 sm:px-6 py-16">
          
          {/* Our Story (Mission & Image) */}
          <motion.section
            className="mb-20 p-6 md:p-12 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-inner dark:shadow-none transition-colors duration-500"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <div className="flex flex-col md:flex-row items-center gap-12">
              <motion.div
                className="w-full md:w-1/2 mt-8 md:mt-0 order-1 md:order-2"
                variants={itemVariants}
              >
                <img
                  src={about_bg_img}
                  alt="Wound Care Visualization"
                  className="rounded-xl shadow-2xl w-full h-auto border-4 border-teal-500/50 dark:border-teal-400/50"
                />
              </motion.div>
              <motion.div
                className="md:w-1/2 order-2 md:order-1"
                variants={itemVariants}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6">
                  Our Mission
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg">
                  At ProMed Health Plus, we are dedicated to transforming
                  wound care by equipping private practices with the tools and
                  support they need to thrive. With over 80% of our services
                  dedicated to empowering independent providers, we guide you
                  from initial setup through seamless reimbursement with expert
                  support at every step. Our streamlined processes, selective
                  partnerships, and unwavering commitment to excellence ensure
                  superior patient outcomes and practice success.
                </p>
              </motion.div>
            </div>
          </motion.section>

          {/* Our Approach (The Three Cards) */}
          <motion.section
            className="bg-teal-50 dark:bg-gray-800 rounded-2xl p-6 md:p-12 mb-20 transition-colors duration-500"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <div className="text-center">
              <motion.h2
                className="text-3xl font-bold text-gray-800 dark:text-white mb-12"
                variants={itemVariants}
              >
                Our Approach To Wound Care Solutions
              </motion.h2>

              <div className="flex justify-center gap-6 flex-col lg:flex-row">
                {about_approach_data.map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 w-full lg:w-1/3 border-t-4 border-teal-400 dark:border-teal-300"
                    variants={itemVariants}
                  >
                    <div className="text-teal-600 dark:text-teal-400 mb-4 flex justify-center text-4xl">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {item.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
          {/* Call to Action */}
          <motion.section
            className="bg-teal-600 text-white rounded-2xl p-10 md:p-16 text-center shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-3xl font-bold mb-2">
              Ready to Advance Your Practice?
            </h2>
            <p className="text-lg md:text-lg mb-12 max-w-3xl mx-auto opacity-90 font-semibold">
              Partner with ProMed Health Plus for unparalleled wound care
              support and reimbursement success.
            </p>
            <motion.button
              onClick={() => setOpen(true)}
              className="bg-white text-teal-700 font-extrabold px-10 py-4 rounded-full hover:bg-gray-100 transition duration-300 shadow-xl text-sm uppercase tracking-wide"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us Today
            </motion.button>
          </motion.section>
        </main>
      </div>

      {/* Modal with Framer Motion Integration */}
      <Modal 
        open={open} 
        onClose={handleClose}
        disablePortal
        hideBackdrop={false}
      >

        <MotionBox 
            sx={modalStyle}
            initial="hidden"
            animate="visible"
            exit="exit" 
            variants={modalVariants}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-none p-8 mx-4 border border-gray-100 dark:border-gray-700 relative transition-colors duration-300"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
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

            {/* Header */}
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
              Get In Touch
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              We’d love to help you. Fill out the form below and we’ll respond
              soon.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Provider Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Dr. John Smith"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              
              {/* ✅ NEW FIELD: Facility Name */}
              <div>
                <label htmlFor="facility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facility Name
                </label>
                <input
                  id="facility"
                  name="facility"
                  type="text"
                  value={formData.facility}
                  onChange={handleChange}
                  required
                  placeholder="Your Practice or Facility Name"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              {/* END NEW FIELD */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Philadelphia"
                    className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="w-2/3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      State
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="" className="bg-white dark:bg-gray-700">
                        Select
                      </option>
                      {states.map((state) => (
                        <option
                          key={state}
                          value={state}
                          className="bg-white dark:bg-gray-700"
                        >
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Zip
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 19103"
                      className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="(123) 456-7890"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Question
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Type your message..."
                  className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                ></textarea>
              </div>
              
              {/* Submission Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
                }`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </motion.div>
        </MotionBox>
      </Modal>
    </div>
  );
};

export default About;