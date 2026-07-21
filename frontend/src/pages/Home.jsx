import React from "react";
import Header from "../components/Header";
import SearchBar from "../components/tours/SearchBar";
import Services from "../components/services/Services";
import AllTours from "../components/tours/AllTours";
import RecentlyViewed from "../components/tours/RecentlyViewed";
import Experience from "../components/services/Experience";
import NewsLetterBox from "../components/ui/NewsLetterBox";
import ParallaxSection from "../components/ui/ParallaxSection";
import Footer from "../components/ui/Footer";

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
          <RecentlyViewed />
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
