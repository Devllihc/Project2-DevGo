import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TourCard from "../../components/tours/TourCard";
import { Map, Sparkles, Compass, Filter, Search, DollarSign, Star } from "lucide-react";
import ParallaxSection from "../../components/ui/ParallaxSection";
import Footer from "../../components/ui/Footer";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", bounce: 0.4 } },
};

const Tour = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [cityFilter, setCityFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (cityFilter) queryParams.append("city", cityFilter);
        if (minPrice) queryParams.append("minPrice", minPrice);
        if (maxPrice) queryParams.append("maxPrice", maxPrice);
        if (minRating) queryParams.append("minRating", minRating);

        const res = await fetch(`${baseUrl}/api/tours?${queryParams.toString()}`);
        const data = await res.json();
        setTours(data);
      } catch (err) {
        console.error("Failed to fetch tours:", err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the fetch slightly to avoid rapid calls while typing
    const timeoutId = setTimeout(() => {
      fetchTours();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [baseUrl, cityFilter, minPrice, maxPrice, minRating]);

  return (
    <div className="bg-stone-950 font-sans selection:bg-accent-500/30 w-full relative">
      <ParallaxSection id="tours-page" bgImage="/tour-background.webp">
        <div className="flex flex-col gap-12 sm:gap-24 w-full pb-4">
          
          {/* Hero Header */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/20"
            >
              <Compass size={32} className="text-white" />
            </motion.div>
            <motion.h1
              className="text-5xl sm:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-amber-300">Our Tours</span>
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-stone-200 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Discover breathtaking destinations, curated experiences, and unforgettable journeys around the globe.
            </motion.p>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="text-accent-500" size={28} />
                <h2 className="text-3xl font-bold text-white">Featured Destinations</h2>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full transition-colors border border-white/10"
              >
                <Filter size={20} />
                <span className="font-medium">{showFilters ? "Hide Filters" : "Show Filters"}</span>
              </button>
            </motion.div>

            {/* Filter Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 mb-10 grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                {/* Search by City */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-300 flex items-center gap-2">
                    <Search size={16} /> Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paris"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-500 outline-none focus:border-accent-500 transition-colors"
                  />
                </div>

                {/* Min Price */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-300 flex items-center gap-2">
                    <DollarSign size={16} /> Min Price
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-500 outline-none focus:border-accent-500 transition-colors"
                  />
                </div>

                {/* Max Price */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-300 flex items-center gap-2">
                    <DollarSign size={16} /> Max Price
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-500 outline-none focus:border-accent-500 transition-colors"
                  />
                </div>

                {/* Minimum Rating */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-300 flex items-center gap-2">
                    <Star size={16} /> Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full bg-stone-900 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-accent-500 transition-colors"
                  >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Tour Cards Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-96 bg-white/10 backdrop-blur-md rounded-3xl animate-pulse border border-white/10"></div>
                ))
              ) : tours.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-3xl border border-dashed border-white/20">
                  <Map size={48} className="text-stone-400 mb-4" />
                  <p className="text-xl text-stone-300 font-medium">No tours found.</p>
                </div>
              ) : (
                tours.map((tour, index) => (
                  <motion.div
                    key={tour._id || index}
                    initial="hidden"
                    animate="visible"
                    variants={slideUp}
                    transition={{ delay: 0.1 * index, duration: 0.6 }}
                    className="group relative h-full"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-400 to-amber-400 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                    <div className="relative h-full">
                      <TourCard tour={tour} />
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>

          <Footer />
        </div>
      </ParallaxSection>
    </div>
  );
};

export default Tour;
