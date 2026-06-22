import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TourCard from "./TourCard";
import { Search } from "lucide-react";

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
      className="flex flex-col items-center justify-center my-32 px-6 lg:px-0 max-w-7xl mx-auto w-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="text-center max-w-3xl mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-white mb-6">
          Find Your Perfect <span className="text-accent-500">Destination</span>
        </h2>
        <p className="text-lg text-stone-600 dark:text-stone-400">
          Discover places based on your interests, budget, and group size.
        </p>
      </div>

      {/* Input Fields */}
      <div className="w-full max-w-5xl bg-white dark:bg-stone-900 p-4 sm:p-6 rounded-[2rem] shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800 flex flex-col md:flex-row gap-4 mb-16 relative z-20">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            placeholder="Search name or location..."
            className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-stone-950 border border-transparent focus:border-accent-200 dark:focus:border-accent-800 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-accent-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <input
          type="number"
          placeholder="Max Price (₹)"
          className="w-full md:w-48 px-6 py-4 bg-stone-50 dark:bg-stone-950 border border-transparent focus:border-accent-200 dark:focus:border-accent-800 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-accent-500/10 transition-all"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Group Size"
          className="w-full md:w-40 px-6 py-4 bg-stone-50 dark:bg-stone-950 border border-transparent focus:border-accent-200 dark:focus:border-accent-800 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-accent-500/10 transition-all"
          value={groupSize}
          onChange={(e) => setGroupSize(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-accent-500 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-accent-600 transition-all hover:shadow-lg hover:shadow-accent-500/20 active:scale-95 whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {filteredTours.length > 0 ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour, index) => (
            <TourCard key={tour._id} tour={tour} index={index} />
          ))}
        </div>
      ) : (searchTerm || maxPrice || groupSize) ? (
        <div className="text-center py-12 px-6 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-3xl">
          <p className="text-lg text-stone-500 dark:text-stone-400">No tours match your criteria. Try adjusting the filters.</p>
        </div>
      ) : null}
    </motion.section>
  );
};

export default SearchBar;
