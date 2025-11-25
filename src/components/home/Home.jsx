import React from "react";
import Hero from "./hero/Hero";
import HeroSection from "./hero/HomeSection";

const Home = () => {
  return (
    // <div className="container mx-auto px-6 py-10 space-y-20 max-w-7xl ">
    //     {/* <Hero /> */}
    //     <HeroSection />
    // </div>
    <div className="w-full min-h-screen">
      <HeroSection />
    </div>
  );
};

export default Home;
