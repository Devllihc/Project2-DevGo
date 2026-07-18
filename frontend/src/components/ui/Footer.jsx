import React from "react";
import { FacebookLogo, TwitterLogo, InstagramLogo } from "@phosphor-icons/react";

const Footer = () => {
  return (
    <footer className="w-full py-12 mt-0 border-t border-stone-200/50 dark:border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-10 lg:px-22 grid grid-cols-1 md:grid-cols-12 gap-16">
        
        <div className="md:col-span-5 flex flex-col items-start">
          <img src="/logoTravel.png" width={140} alt="DevGo Logo" className="mb-8 opacity-90 drop-shadow-sm" />
          <p className="text-lg text-stone-500 dark:text-stone-400 max-w-[24ch] leading-relaxed font-light">
            Powered by innovation. Crafted for the modern explorer.
          </p>
        </div>
        
        <div className="md:col-span-4 flex flex-col sm:flex-row gap-12 lg:gap-24">
          <div className="flex flex-col gap-5">
            <h4 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-900 dark:text-white mb-2">Company</h4>
            <a href="#" className="text-sm font-medium text-stone-500 hover:text-accent-500 dark:text-stone-400 dark:hover:text-accent-400 transition-colors duration-300">About Us</a>
            <a href="#" className="text-sm font-medium text-stone-500 hover:text-accent-500 dark:text-stone-400 dark:hover:text-accent-400 transition-colors duration-300">Careers</a>
            <a href="#" className="text-sm font-medium text-stone-500 hover:text-accent-500 dark:text-stone-400 dark:hover:text-accent-400 transition-colors duration-300">Press</a>
          </div>
          <div className="flex flex-col gap-5">
            <h4 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-900 dark:text-white mb-2">Legal</h4>
            <a href="#" className="text-sm font-medium text-stone-500 hover:text-accent-500 dark:text-stone-400 dark:hover:text-accent-400 transition-colors duration-300">Terms of Service</a>
            <a href="#" className="text-sm font-medium text-stone-500 hover:text-accent-500 dark:text-stone-400 dark:hover:text-accent-400 transition-colors duration-300">Privacy Policy</a>
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col items-start md:items-end gap-6">
          <h4 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-900 dark:text-white">Connect</h4>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-400 hover:bg-accent-50 dark:hover:bg-accent-500/10 hover:text-accent-600 dark:hover:text-accent-400 hover:border-accent-200 dark:hover:border-accent-500/30 hover:shadow-sm transition-all duration-300 active:scale-95">
              <FacebookLogo size={20} weight="light" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-400 hover:bg-accent-50 dark:hover:bg-accent-500/10 hover:text-accent-600 dark:hover:text-accent-400 hover:border-accent-200 dark:hover:border-accent-500/30 hover:shadow-sm transition-all duration-300 active:scale-95">
              <TwitterLogo size={20} weight="light" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-400 hover:bg-accent-50 dark:hover:bg-accent-500/10 hover:text-accent-600 dark:hover:text-accent-400 hover:border-accent-200 dark:hover:border-accent-500/30 hover:shadow-sm transition-all duration-300 active:scale-95">
              <InstagramLogo size={20} weight="light" />
            </a>
          </div>
        </div>

        <div className="md:col-span-12 pt-8 mt-8 border-t border-stone-200/50 dark:border-stone-800/50 flex flex-col items-center md:items-start">
          <p className="text-sm font-medium text-stone-400 dark:text-stone-600">
            &copy; {new Date().getFullYear()} DevGo. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
