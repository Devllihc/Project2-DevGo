import React from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Services from "../components/Services";
import AllTours from "../components/AllTours";
import Experience from "../components/Experience";
import NewsLetterBox from "../components/NewsLetterBox";
import ParallaxSection from "../components/ParallaxSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="bg-stone-950 font-sans selection:bg-accent-500/30 w-full relative">
      {/* 
        Home Page with single parallax background
      */}
      <ParallaxSection id="home-section" bgImage="/home-background.webp" priority={true}>
        <div className="flex flex-col gap-12 sm:gap-24 w-full pb-4">
          <Header />
          <div className="-mt-20 sm:-mt-32 relative z-20">
            <SearchBar />
          </div>
          <Services />
          <AllTours />
          <Experience />
          <div className="px-4 sm:px-6">
            <NewsLetterBox />
          </div>
          <Footer />
        </div>
      </ParallaxSection>
    </div>
  );
};

export default Home;
