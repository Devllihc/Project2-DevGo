import React from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Services from "../components/Services";
import AllTours from "../components/AllTours";
import Experience from "../components/Experience";
import NewsLetterBox from "../components/NewsLetterBox";

const Home = () => {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans selection:bg-accent-500/30 overflow-hidden relative">
      {/* Global Decorative Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-[-10%] w-[50vw] h-[50vw] bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[-10%] w-[40vw] h-[40vw] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[60vw] h-[60vw] bg-accent-400/5 dark:bg-accent-400/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-12 sm:gap-24 pb-24">
        <Header />
        
        {/* SearchBar floating over Header */}
        <div className="-mt-20 sm:-mt-32 relative z-20">
          <SearchBar />
        </div>

        <Services />
        <AllTours />
        <Experience />
        
        <div className="px-4 sm:px-6">
          <NewsLetterBox />
        </div>
      </div>
    </div>
  );
};

export default Home;
