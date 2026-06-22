import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
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
  Search, // Icon tìm kiếm
  X,      // Icon xóa tìm kiếm
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
      
      // Tạo query params: page, limit, và search (nếu có)
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

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-stone-50 dark:bg-stone-950 font-sans">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        {/* Title */}
        <div>
          <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="text-amber-500" /> My Trips
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            Manage and review generated itineraries
          </p>
        </div>

        {/* Action Group: Search Bar + Create Button */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
          
          {/* Thanh Tìm Kiếm */}
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 group-focus-within:text-accent-500 transition-colors" size={18} />
            <input 
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all text-sm font-medium shadow-sm text-stone-900 dark:text-stone-100"
            />
            {keyword && (
              <button 
                onClick={() => setKeyword("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Nút Tạo */}
          <button
            onClick={() => navigate("/generate")}
            className="bg-accent-500 hover:bg-accent-600 text-white px-5 py-2.5 rounded-full flex items-center justify-center gap-2 transition hover:-translate-y-0.5 font-medium whitespace-nowrap"
          >
            <Plus size={20} /> Create new itinerary
          </button>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      {loading ? (
        // Loading Skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-stone-200 dark:bg-stone-800 rounded-3xl animate-pulse border border-stone-200 dark:border-stone-800"></div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        // Empty State (Xử lý 2 trường hợp)
        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 border-dashed">
          {keyword ? (
             // Case 1: Tìm kiếm nhưng không thấy kết quả
             <>
               <Search size={64} className="mx-auto text-stone-300 dark:text-stone-600 mb-4" />
               <h3 className="text-xl font-semibold text-stone-700 dark:text-stone-200">No results found</h3>
               <p className="text-stone-500 dark:text-stone-400 mb-6 mt-2">
                 No trips matching the keyword "{keyword}"
               </p>
               <button 
                 onClick={() => setKeyword("")} 
                 className="text-accent-500 font-medium hover:underline px-4 py-2 bg-accent-50 dark:bg-accent-950/20 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
               >
                 Clear search filter
               </button>
             </>
          ) : (
             // Case 2: Chưa có dữ liệu nào
             <>
                <MapPin size={64} className="mx-auto text-stone-300 dark:text-stone-600 mb-4" />
                <h3 className="text-xl font-semibold text-stone-700 dark:text-stone-200">You don't have any trips yet</h3>
                <p className="text-stone-500 dark:text-stone-400 mb-6 mt-2">Try creating a travel itinerary right now!</p>
                <button
                  onClick={() => navigate("/generate")}
                  className="text-accent-500 font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  Start exploring <ArrowRight size={16} />
                </button>
             </>
          )}
        </div>
      ) : (
        <>
          {/* Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {trips.map((trip) => (
              <div
                key={trip._id}
                className="group bg-white dark:bg-stone-900 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden cursor-pointer relative hover:-translate-y-1"
                onClick={() => navigate(`/trip/${trip._id}`)}
              >
                {/* Decorative Gradient Header */}
                <div className="h-36 bg-accent-500 p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>

                  <div className="flex justify-between items-start z-10">
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-medium border border-white/20 flex items-center gap-1">
                      <CalendarDays size={12} /> {formatDate(trip.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-white font-bold text-xl drop-shadow-sm line-clamp-2 z-10">
                    {trip.trip_name || "Unnamed trip"}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Prompt Summary */}
                    <p className="text-stone-500 dark:text-stone-400 text-sm line-clamp-2 mb-4 h-10">
                      {trip.prompt || "No additional description."}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-accent-50 dark:bg-accent-950/20 p-3 rounded-xl border border-accent-100 dark:border-accent-900/30">
                        <div className="flex items-center gap-1 text-accent-600 dark:text-accent-400 mb-1">
                          <Clock size={16} />
                          <span className="text-xs font-semibold uppercase">
                            Duration
                          </span>
                        </div>
                        <span className="text-stone-700 dark:text-stone-200 font-bold">
                          {trip.total_days} Days
                        </span>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-500 mb-1">
                          <Banknote size={16} />
                          <span className="text-xs font-semibold uppercase">
                            Cost
                          </span>
                        </div>
                        <span className="text-stone-700 dark:text-stone-200 font-bold text-sm">
                          {trip.total_cost
                            ? formatCurrency(trip.total_cost)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-4 mt-2">
                    <span className="text-xs text-stone-400 dark:text-stone-500">
                      Saved successfully
                    </span>
                    <div className="flex items-center text-accent-500 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      View details <ArrowRight size={16} className="ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- PAGINATION CONTROLS --- */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pb-8">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-full border transition ${
                  currentPage === 1
                    ? "bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 border-stone-200 dark:border-stone-700 cursor-not-allowed"
                    : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-accent-500"
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
                Page{" "}
                <span className="text-accent-500 font-bold">{currentPage}</span> /{" "}
                {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full border transition ${
                  currentPage === totalPages
                    ? "bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 border-stone-200 dark:border-stone-700 cursor-not-allowed"
                    : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-accent-500"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyTrips;