import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import ParallaxSection from "../../components/ui/ParallaxSection";
import {
  MapPin,
  ArrowRight,
  Plus,
  Clock,
  Banknote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  X,
} from "lucide-react";

const MyTrips = () => {
  const { token } = useContext(AppContext);
  const navigate = useNavigate();

  // --- STATES ---
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Search Logic
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  // --- HELPER FUNCTIONS ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
      if (keyword !== debouncedKeyword) {
        setCurrentPage(1);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword]);

  useEffect(() => {
    fetchTrips(currentPage, debouncedKeyword);
  }, [currentPage, debouncedKeyword, token]);

  const fetchTrips = async (page, searchHelper) => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      const searchQuery = searchHelper ? `&search=${encodeURIComponent(searchHelper)}` : "";
      
      const res = await axios.get(
        `${backendUrl}/api/planner/history?page=${page}&limit=${ITEMS_PER_PAGE}${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setTrips(res.data.data);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error loading list:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="bg-stone-950 font-sans selection:bg-accent-500/30 w-full relative">
      <ParallaxSection id="mytrips-page" bgImage="/trip-background.webp">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 max-w-7xl mx-auto min-h-screen font-sans w-full"
        >
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="text-amber-500" /> My Trips
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">
            Manage and review your AI-generated travel itineraries
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
          
          {/* Search Bar */}
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 group-focus-within:text-accent-500 dark:group-focus-within:text-accent-400 transition-colors" size={18} />
            <input 
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search trips..."
              className="w-full pl-11 pr-10 py-3 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md border border-stone-200 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all text-sm shadow-sm text-stone-900 dark:text-stone-100"
            />
            {keyword && (
              <button 
                onClick={() => setKeyword("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 p-1 bg-stone-100 dark:bg-stone-800 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Create Button */}
          <button
            onClick={() => navigate("/generate")}
            className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5 font-bold whitespace-nowrap shadow-sm"
          >
            <Plus size={20} /> Create New
          </button>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      {loading ? (
        // Loading Skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md rounded-3xl animate-pulse border border-stone-200/50 dark:border-stone-800/50"></div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        // Empty State
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 border-dashed"
        >
          {keyword ? (
             <>
               <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Search size={32} className="text-stone-400 dark:text-stone-500" />
               </div>
               <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">No results found</h3>
               <p className="text-stone-500 dark:text-stone-400 mb-8 mt-2 max-w-md mx-auto">
                 We couldn't find any trips matching "{keyword}". Try using different keywords or clear your search.
               </p>
               <button 
                 onClick={() => setKeyword("")} 
                 className="text-accent-600 dark:text-accent-400 font-bold px-6 py-2.5 bg-accent-50 dark:bg-accent-900/30 rounded-xl hover:bg-accent-100 dark:hover:bg-accent-900/50 transition-colors"
               >
                 Clear Search
               </button>
             </>
          ) : (
             <>
                <div className="w-20 h-20 bg-accent-50 dark:bg-accent-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin size={32} className="text-accent-500 dark:text-accent-400" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">You don't have any trips yet</h3>
                <p className="text-stone-500 dark:text-stone-400 mb-8 mt-2 max-w-md mx-auto">
                  Start your adventure by creating a personalized AI travel itinerary.
                </p>
                <button
                  onClick={() => navigate("/generate")}
                  className="text-white bg-accent-500 hover:bg-accent-600 font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 mx-auto shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  Start Exploring <ArrowRight size={18} />
                </button>
             </>
          )}
        </motion.div>
      ) : (
        <>
          {/* Grid List */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          >
            {trips.map((trip) => (
              <motion.div
                variants={itemVariants}
                key={trip._id}
                className="group bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden cursor-pointer relative hover:-translate-y-1.5"
                onClick={() => navigate(`/trip/${trip._id}`)}
              >
                {/* Decorative Gradient Header */}
                <div className="h-36 bg-gradient-to-br from-accent-500 to-accent-600 dark:from-accent-600 dark:to-accent-900 p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/20 blur-3xl group-hover:bg-white/30 transition-all duration-500"></div>

                  <div className="flex justify-between items-start z-10">
                    <span className="bg-white/20 dark:bg-black/20 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg font-bold border border-white/20 dark:border-white/10 flex items-center gap-1.5 shadow-sm">
                      <CalendarDays size={14} /> {formatDate(trip.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-white font-bold text-xl drop-shadow-md line-clamp-2 z-10 leading-snug">
                    {trip.trip_name || "Unnamed trip"}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Prompt Summary */}
                    <p className="text-stone-500 dark:text-stone-400 text-sm line-clamp-2 mb-6 h-10 leading-relaxed">
                      {trip.prompt || "No additional description available for this itinerary."}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-stone-50 dark:bg-stone-950/50 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800/80 transition-colors group-hover:border-accent-200 dark:group-hover:border-accent-900/50">
                        <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mb-1.5">
                          <Clock size={16} className="text-accent-500 dark:text-accent-400" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Duration
                          </span>
                        </div>
                        <span className="text-stone-900 dark:text-stone-100 font-bold text-lg">
                          {trip.total_days} <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Days</span>
                        </span>
                      </div>
                      <div className="bg-stone-50 dark:bg-stone-950/50 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800/80 transition-colors group-hover:border-green-200 dark:group-hover:border-green-900/50">
                        <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mb-1.5">
                          <Banknote size={16} className="text-green-500 dark:text-green-400" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Cost
                          </span>
                        </div>
                        <span className="text-stone-900 dark:text-stone-100 font-bold text-lg truncate block">
                          {trip.total_cost
                            ? formatCurrency(trip.total_cost).replace('₫', '').trim()
                            : "N/A"} <span className="text-sm font-medium text-stone-500 dark:text-stone-400">{trip.total_cost ? '₫' : ''}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800/80 pt-5">
                    <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-md">
                      Saved
                    </span>
                    <div className="flex items-center text-accent-500 dark:text-accent-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
                      View Details <ArrowRight size={16} className="ml-1.5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* --- PAGINATION CONTROLS --- */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pb-12">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-2.5 rounded-xl border transition-all ${
                  currentPage === 1
                    ? "bg-stone-50 dark:bg-stone-900/50 text-stone-300 dark:text-stone-700 border-stone-200 dark:border-stone-800 cursor-not-allowed"
                    : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-accent-500 shadow-sm"
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              <div className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm text-sm font-semibold text-stone-600 dark:text-stone-300">
                Page <span className="text-accent-500 dark:text-accent-400 text-base">{currentPage}</span> of {totalPages}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2.5 rounded-xl border transition-all ${
                  currentPage === totalPages
                    ? "bg-stone-50 dark:bg-stone-900/50 text-stone-300 dark:text-stone-700 border-stone-200 dark:border-stone-800 cursor-not-allowed"
                    : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-accent-500 shadow-sm"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
      </ParallaxSection>
    </div>
  );
};

export default MyTrips;