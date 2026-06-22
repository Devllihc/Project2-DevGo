import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="w-full border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 py-8 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <img src="/logoTravel.png" width={140} alt="DevGo Logo" className="mb-2 drop-shadow-sm" />
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Powered by Innovation.
          </p>
        </div>
        
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400 text-center md:text-left">
          &copy; {new Date().getFullYear()} DevGo. All Rights Reserved.
        </p>
        
        <div className="flex gap-4">
          <button onClick={() => window.open("https://www.facebook.com/", "_blank")} className="hover:opacity-80 hover:scale-105 transition-all">
            <img src={assets.facebook_icon} alt="Facebook" width={32} />
          </button>
          <button onClick={() => window.open("https://www.twitter.com/", "_blank")} className="hover:opacity-80 hover:scale-105 transition-all">
            <img src={assets.twitter_icon} alt="Twitter" width={32} />
          </button>
          <button onClick={() => window.open("https://www.instagram.com/", "_blank")} className="hover:opacity-80 hover:scale-105 transition-all">
            <img src={assets.instagram_icon} alt="Instagram" width={32} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
