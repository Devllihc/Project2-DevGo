import React from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

const NewsLetterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
    event.target.reset();
    toast.success("Thank you for subscribing!");
  };

  return (
    <section className="py-12 max-w-6xl mx-auto w-full relative">
      <motion.div
        className="relative overflow-hidden rounded-[3rem] bg-stone-900 px-6 py-20 sm:px-16 sm:py-24 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-accent-600/30 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 right-10 w-80 h-80 bg-accent-500/30 rounded-full blur-[100px] pointer-events-none" />
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
        </div>
        
        <div className="relative z-10 lg:w-1/2 text-center lg:text-left">
          <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-bold tracking-[0.2em] uppercase text-accent-400">
            Newsletter
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Subscribe for <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-amber-300">Exclusive Offers</span>
          </h2>
          <p className="text-lg text-stone-300 max-w-lg mx-auto lg:mx-0">
            Stay one step ahead with our curated travel alerts, insider tips, and early access to special tours. No spam, just pure wanderlust.
          </p>
        </div>
        
        <div className="relative z-10 lg:w-1/2 w-full flex justify-center lg:justify-end">
          <form
            onSubmit={onSubmitHandler}
            className="w-full max-w-md relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-500 to-amber-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/20 shadow-2xl">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-transparent text-white placeholder-stone-400 px-6 py-4 rounded-[1.5rem] focus:outline-none transition-all font-medium"
                required
              />
              <button
                type="submit"
                className="bg-accent-500 text-white font-bold px-8 py-4 rounded-[1.5rem] hover:bg-accent-400 active:scale-95 transition-all shadow-lg shadow-accent-500/20 whitespace-nowrap flex items-center justify-center gap-2"
              >
                <span>Subscribe</span>
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default NewsLetterBox;
