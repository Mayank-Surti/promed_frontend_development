import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // <-- Import AnimatePresence
import woundcare_img from '../../../assets/images/main-promed-square.jpg'
import promed_video from '../../../assets/videos/homepage-video.mp4'
import ContactModal from "./ContactModal";
import FloatingParticles from "../FloatingParticles"
import toast from 'react-hot-toast'; 
import axios from "axios"; 

const HeroSection = () => {
  const [open, setOpen] = useState(false);

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

  const handleOpen = () => setOpen(true);
  
  const handleClose = () => {
    setOpen(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, phone, question, facility, city, state, zip } = formData;
    if (!name || !facility || !city || !state || !zip || !phone || !email || !question) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/v1/contact-us/',
        formData
      );
      toast.success("Your message has been sent. We'll get back to you soon!");
      
      handleClose(); 
    } catch (error) {
      console.error(
        "Failed to send message:",
        error.response?.data || error.message
      );
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Framer Motion Variants
  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };
  const imageVariants = {
    hidden: {
      opacity: 0,
      x: 50
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, delay: 0.3 }
    }
  };
  const slideFromLeftVariants = {
    hidden: { opacity: 0, x: "-100vw" },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.65, ease: "easeOut" }
    }
  }
  const slideFromTopVariants = {
    hidden: { opacity: 0, y: "-100vw" },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: "easeOut" }
    }
  }
  const subtitleVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 150, damping: 20 }
    },
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 transition-colors duration-500">

      {/* Video Banner */}
      <div className="pt-20">
        <video
          src={promed_video}
          autoPlay
          loop
          muted
          playsInline
          className=""
        />
      </div>

      <section className="relative flex items-center justify-center overflow-hidden px-4 py-28 lg:py-24">
        {/* Background gradient */}
        <motion.div
          className="absolute inset-0 
            dark:bg-gradient-to-br dark:from-transparent dark:via-teal-400/10 dark:to-teal-600/30
            bg-gradient-to-br from-teal-300 via-teal-100 to-white"
          initial="hidden"
          animate="visible"
          variants={backgroundVariants}
        />

        {/* Floating particles */}
        <FloatingParticles />


        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center lg:flex-row lg:justify-center lg:gap-16">

          {/* Text column */}
          <motion.div
            className="flex flex-col items-center text-center lg:text-center relative z-10"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 1 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
          >
            {/* Title row */}
            <div className="flex items-center justify-center gap-4 flex-wrap">

              {/* "ProMed Health" sliding from left */}
              <motion.span
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-700 dark:text-white whitespace-nowrap"
                variants={slideFromLeftVariants}
              >
                ProMed Health
              </motion.span>

              {/* "Plus" sliding from top */}
              <motion.span
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-teal-500 dark:text-teal-400 whitespace-nowrap"
                variants={slideFromTopVariants}
              >
                Plus
              </motion.span>
            </div>

            {/* Subtitle */}
            <motion.p
              className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl md:text-2xl mt-8 max-w-lg"
              variants={subtitleVariants}
            >
              Advancing Wound Care for a New Generation
            </motion.p>
              
            {/* Contact button */}
            <motion.button
              onClick={handleOpen}
              className="px-10 py-4 bg-teal-500 text-white rounded-full inline-block mt-8 font-bold text-sm uppercase tracking-wider hover:bg-teal-700 transition-colors duration-300"
              variants={itemVariants}
              whileHover={{ scale: 1.05, boxShadow: "0 15px 25px rgba(0, 0, 0, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.button>
            
          </motion.div>

          {/* Image column (next to title) */}
          <motion.div
            className="block relative pt-10"
            initial="hidden"
            animate="visible"
            variants={imageVariants}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-teal-400/20 blur-3xl rounded-full" />
              
              <img
                src={woundcare_img}
                className="relative z-10 w-[30rem] lg:w-[35rem] dark:opacity-80 object-contain drop-shadow-2xl rounded-3xl mb-4 lg:mb-0"
                alt="woundcare square"
              />
            </div>
          </motion.div>
            
        </div>
      </section>
      
      <AnimatePresence>
        {open && (
            <ContactModal 
              open={open} 
              handleClose={handleClose} 
              formData={formData} 
              handleChange={handleChange} 
              handleSubmit={handleSubmit}
            />
        )}  
      </AnimatePresence>
    </div>
  );
};

export default HeroSection;