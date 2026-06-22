import React from "react";
import { motion } from "framer-motion";

const Experience = () => {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-0 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-white mb-6">
            Experience the <span className="text-accent-500">DevGo</span> Difference
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
            With years of experience in curating unforgettable journeys, we provide the highest quality services to ensure your travel is seamless, safe, and truly exceptional.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-8 lg:gap-12">
          {[
            { number: "12k+", label: "Successful Trips" },
            { number: "2k+", label: "Regular Clients" },
            { number: "10+", label: "Years Experience" },
            { number: "4.9", label: "Average Rating" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="flex flex-col border-l-2 border-accent-200 pl-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-4xl sm:text-5xl font-bold tracking-tighter text-stone-900 dark:text-white mb-2">
                {stat.number}
              </span>
              <span className="text-sm sm:text-base font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
