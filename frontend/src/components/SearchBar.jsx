import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TourCard from "./TourCard";
import { Search, MapPin, DollarSign, Users } from "lucide-react";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);

  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/tours`);
        const data = await res.json();
        setTours(data);
      } catch (err) {
        console.error("Failed to fetch tours:", err);
      }
    };

    fetchTours();
  }, [baseUrl]);

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();

    const results = tours.filter((tour) => {
      const matchesTerm =
        [tour.title, tour.city, tour.desc].join(" ").toLowerCase().includes(term);

      const matchesPrice =
        maxPrice === "" || parseFloat(tour.price) <= parseFloat(maxPrice);

      const matchesGroupSize =
        groupSize === "" || parseInt(tour.maxGroupSize) >= parseInt(groupSize);

      return matchesTerm && matchesPrice && matchesGroupSize;
    });

    setFilteredTours(results);
  };

  return (
    <motion.section
      className="flex flex-col items-center justify-center px-6 lg:px-0 max-w-6xl mx-auto w-full"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
    >
      {/* Floating Search Container */}
      <div className="w-full bg-white/70 dark:bg-stone-900/70 backdrop-blur-2xl p-4 sm:p-5 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-white/50 dark:border-stone-700/50 flex flex-col md:flex-row gap-3 relative z-30">
        
        {/* Destination Input */}
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <MapPin className="w-5 h-5 text-stone-400 dark:text-stone-500 group-focus-within:text-accent-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Where do you want to go?"
            className="w-full pl-14 pr-4 py-4 sm:py-5 bg-stone-50/50 dark:bg-stone-950/50 border border-transparent focus:bg-white dark:focus:bg-stone-900 focus:border-accent-200 dark:focus:border-accent-800 rounded-[1.5rem] text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-accent-500/10 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-stone-200 dark:bg-stone-800 my-4"></div>

        {/* Price Input */}
        <div className="w-full md:w-56 relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <DollarSign className="w-5 h-5 text-stone-400 dark:text-stone-500 group-focus-within:text-accent-500 transition-colors" />
          </div>
          <input
            type="number"
            placeholder="Max Price"
            className="w-full pl-12 pr-4 py-4 sm:py-5 bg-stone-50/50 dark:bg-stone-950/50 border border-transparent focus:bg-white dark:focus:bg-stone-900 focus:border-accent-200 dark:focus:border-accent-800 rounded-[1.5rem] text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-accent-500/10 transition-all font-medium"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-stone-200 dark:bg-stone-800 my-4"></div>

        {/* Group Size Input */}
        <div className="w-full md:w-48 relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Users className="w-5 h-5 text-stone-400 dark:text-stone-500 group-focus-within:text-accent-500 transition-colors" />
          </div>
          <input
            type="number"
            placeholder="Guests"
            className="w-full pl-12 pr-4 py-4 sm:py-5 bg-stone-50/50 dark:bg-stone-950/50 border border-transparent focus:bg-white dark:focus:bg-stone-900 focus:border-accent-200 dark:focus:border-accent-800 rounded-[1.5rem] text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-accent-500/10 transition-all font-medium"
            value={groupSize}
            onChange={(e) => setGroupSize(e.target.value)}
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-accent-500 text-white font-bold px-8 py-4 sm:py-5 rounded-[1.5rem] hover:bg-accent-600 transition-all hover:shadow-[0_8px_20px_rgba(20,184,166,0.3)] active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
        >
          <Search size={20} />
          <span>Search</span>
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {(filteredTours.length > 0 || searchTerm || maxPrice || groupSize) && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 48 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="w-full"
          >
            {filteredTours.length > 0 ? (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTours.map((tour, index) => (
                  <TourCard key={tour._id} tour={tour} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-3xl mx-auto bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
                <p className="text-xl text-stone-600 dark:text-stone-400 font-medium">No tours match your criteria.</p>
                <p className="text-stone-500 dark:text-stone-500 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default SearchBar;
