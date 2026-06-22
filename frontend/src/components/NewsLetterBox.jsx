import React from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const NewsLetterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
    event.target.reset();
    toast.success("Thank you for subscribing!");
  };

  return (
    <section className="py-24 px-6 md:px-12 lg:px-0 max-w-7xl mx-auto w-full">
      <motion.div
        className="relative overflow-hidden rounded-[2rem] bg-stone-900 px-6 py-20 sm:px-16 sm:py-24 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-400 via-transparent to-transparent pointer-events-none" />
        
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 relative z-10">
          Subscribe for <span className="text-accent-400">Exclusive Offers</span>
        </h2>
        <p className="text-lg text-stone-300 mb-10 max-w-2xl relative z-10">
          Stay one step ahead with our curated travel alerts, insider tips, and early access to special tours.
        </p>
        
        <form
          onSubmit={onSubmitHandler}
          className="w-full max-w-md flex flex-col sm:flex-row gap-3 relative z-10"
        >
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 bg-white/10 border border-white/20 text-white placeholder-stone-400 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white/20 transition-all"
            required
          />
          <button
            type="submit"
            className="bg-accent-500 text-white font-medium px-8 py-4 rounded-full hover:bg-accent-400 active:scale-95 transition-all shadow-lg shadow-accent-500/20 whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default NewsLetterBox;
