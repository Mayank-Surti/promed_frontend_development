import React, { useState } from "react"; 
import { Shield, Package, CheckCircle, Phone, Mail, MapPin, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from 'react-hot-toast'; 
import axios from "axios";
import FloatingParticles from "../home/FloatingParticles"

// Import states array - make sure this path is correct for your project
// import { states } from "../../utils/data";

// Temporary states array - replace with import above
const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const Products = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    facility: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    question: ''
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const products = [
    {
      id: 1,
      title: "Allograft Skin",
      manufacturer: "TissueTech",
      description:
        "Premium human allograft skin tissue for critical wound care. Processed using advanced preservation techniques to maintain cellular integrity and promote optimal healing.",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=500&fit=crop",
    },
    {
      id: 2,
      title: "Xenograft Matrix",
      manufacturer: "BioCore",
      description:
        "Porcine-derived dermal matrix for wound coverage and tissue regeneration. Sterile, acellular scaffold that supports natural healing processes.",
      image:
        "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=500&fit=crop",
    },
    {
      id: 3,
      title: "Synthetic Skin Substitute",
      manufacturer: "MedTech Solutions",
      description:
        "Advanced bioengineered skin substitute with bilayer structure. Provides immediate protection while promoting dermal regeneration for burn and trauma patients.",
      image:
        "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=400&h=500&fit=crop",
    },
  ];  

  const features = [
    "Naturally derived and biocompatible materials",
    "Designed for clinical use in wound management",
    "Distributed under regulated handling procedures",
    "Available in various sizes and configurations"
  ];

  const solutions = [
    "Helps maintain a moist and protective wound setting",
    "Suitable for multiple wound care protocols",
    "Backed by reliable quality and compliance documentation",
    "Simplifies product access through our integrated provider portal"
  ];

  const whyChoose = [
    {
      icon: Shield,
      title: "Medical Director Oversight",
      description: "Every partnership and product decision is guided by clinical expertise and best practices"
    },
    {
      icon: Package,
      title: "All-in-One Portal",
      description: "Providers can manage care, documentation, and orders from a single secure platform"
    },
    {
      icon: Zap,
      title: "One-Stop Distribution",
      description: "Streamlined access to advanced biologic and wound care products, all under one compliant system"
    }
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      facility: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: '',
      question: ''
    });
  };

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
      resetForm();
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

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden transition-colors duration-500 min-h-screen">
      
      <FloatingParticles />
      
      {/* Hero Header Section */}
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
            Promed Health <span className="text-teal-500">Plus</span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl mt-4 max-w-4xl mx-auto opacity-90 text-gray-600 dark:text-gray-300 font-semibold"
            variants={itemVariants}
          >
            Advanced Wound Care Solutions Trusted by Providers
          </motion.p>
        </div>
      </motion.header>

      {/* Main Content Container */}
      <main className="container mx-auto px-4 sm:px-6 py-16">
        
        {/* Overview Section - Card Style */}
        <motion.section
          className="mb-20 p-6 md:p-12 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-500"
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
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop"
                alt="Medical professional"
                className="rounded-xl shadow-2xl w-full h-auto border-4 border-teal-500/50 dark:border-teal-400/50"
              />
            </motion.div>
            
            <motion.div
              className="md:w-1/2 order-2 md:order-1"
              variants={itemVariants}
            >
              <div className="inline-block bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 transition-colors duration-300">
                Advanced Wound Care Solutions
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6">
                Trusted by Providers
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                ProMed Health Plus provides advanced wound care and skin substitute solutions that help providers simplify care delivery, support proper documentation, and improve workflow efficiency. Our commitment to excellence ensures superior patient outcomes and practice success.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Biologic Skin Substitutes Section - Card Style */}
        <motion.section
          className="mb-20 p-6 md:p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-500"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Biologic Skin <span className="text-teal-500">Substitutes</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Used in clinical settings to assist in the management of chronic and complex wounds. Our biologic materials are handled and distributed under strict compliance standards to ensure product quality and traceability.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-teal-50 dark:hover:bg-gray-600 transition-all group border border-gray-200 dark:border-gray-600"
              >
                <CheckCircle className="text-teal-500 dark:text-teal-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" size={24} />
                <p className="text-base text-gray-700 dark:text-gray-300">{feature}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-teal-500 to-teal-700 dark:from-teal-600 dark:to-teal-800 rounded-2xl p-8 md:p-10 text-white transition-colors duration-300"
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Advanced Wound Care Solutions</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {solutions.map((solution, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1 flex-shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <p className="text-base leading-relaxed">{solution}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Why Choose ProMed Section - Card Style */}
        <motion.section
          className="mb-20 p-6 md:p-12 bg-teal-50 dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-500"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Providers Choose <span className="text-teal-500">ProMed</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyChoose.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all group border border-gray-200 dark:border-gray-600"
              >
                <div className="bg-teal-100 dark:bg-teal-900 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-500 dark:group-hover:bg-teal-600 transition-colors">
                  <item.icon className="text-teal-500 dark:text-teal-300 group-hover:text-white transition-colors" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact Section - Card Style */}
        <motion.section
          className="p-6 md:p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-500"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Get in <span className="text-teal-500">Touch</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Ready to partner with us? Our team is here to help.</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[
                { icon: Phone, title: "Phone", info: "(888)338 - 0490", sub: "Mon-Fri 8am-6pm EST" },
                { icon: Mail, title: "Email", info: "portal@promedhealthplus.com", sub: "Response within 24 hours" },
                { icon: MapPin, title: "Location", info: "30839 Thousand Oaks Blvd", sub: "Westlake Village, CA 91362" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-teal-50 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                >
                  <div className="bg-teal-500 dark:bg-teal-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{item.info}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              variants={itemVariants}
              className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-600 transition-colors duration-300"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 outline-none transition-all"
                    placeholder="e.g., Dr. John Smith"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    Facility Name
                  </label>
                  <input
                    type="text"
                    name="facility"
                    value={formData.facility}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 outline-none transition-all"
                    placeholder="Your Practice or Facility Name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 outline-none transition-all"
                      placeholder="e.g. Philadelphia"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                        State
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 outline-none transition-all"
                      >
                        <option value="">Select</option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 outline-none transition-all"
                    placeholder="e.g. 19103"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 outline-none transition-all"
                    placeholder="(123) 456-7890"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    Message
                  </label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 outline-none transition-all resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white font-semibold py-4 rounded-xl shadow-lg transition-all ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </motion.section>

      </main>
    </div>
  );
};

export default Products;