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
      console.error("Lỗi tải danh sách:", error);
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
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 font-sans">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        {/* Title */}
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-yellow-500" /> Chuyến đi của tôi
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý và xem lại các lịch trình đã tạo
          </p>
        </div>

        {/* Action Group: Search Bar + Create Button */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
          
          {/* Thanh Tìm Kiếm */}
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium shadow-sm"
            />
            {keyword && (
              <button 
                onClick={() => setKeyword("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Nút Tạo */}
          <button
            onClick={() => navigate("/generate")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full flex items-center justify-center gap-2 transition shadow-lg hover:shadow-blue-500/30 font-medium whitespace-nowrap"
          >
            <Plus size={20} /> Tạo lịch trình mới
          </button>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      {loading ? (
        // Loading Skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        // Empty State (Xử lý 2 trường hợp)
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed">
          {keyword ? (
             // Case 1: Tìm kiếm nhưng không thấy kết quả
             <>
               <Search size={64} className="mx-auto text-gray-300 mb-4" />
               <h3 className="text-xl font-semibold text-gray-700">Không tìm thấy kết quả</h3>
               <p className="text-gray-500 mb-6 mt-2">
                 Không có chuyến đi nào khớp với từ khóa "{keyword}"
               </p>
               <button 
                 onClick={() => setKeyword("")} 
                 className="text-blue-600 font-medium hover:underline px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
               >
                 Xóa bộ lọc tìm kiếm
               </button>
             </>
          ) : (
             // Case 2: Chưa có dữ liệu nào
             <>
                <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Bạn chưa có chuyến đi nào</h3>
                <p className="text-gray-500 mb-6 mt-2">Hãy thử tạo một lịch trình du lịch ngay bây giờ!</p>
                <button
                  onClick={() => navigate("/generate")}
                  className="text-blue-600 font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  Bắt đầu khám phá <ArrowRight size={16} />
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
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden cursor-pointer relative"
                onClick={() => navigate(`/trip/${trip._id}`)}
              >
                {/* Decorative Gradient Header */}
                <div className="h-36 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>

                  <div className="flex justify-between items-start z-10">
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-medium border border-white/20 flex items-center gap-1">
                      <CalendarDays size={12} /> {formatDate(trip.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-white font-bold text-xl drop-shadow-sm line-clamp-2 z-10">
                    {trip.trip_name || "Chuyến đi chưa đặt tên"}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Prompt Summary */}
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                      {trip.prompt
                        ? trip.prompt.replace("Đi ", "Du lịch đến ")
                        : "Không có mô tả thêm."}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 p-3 rounded-xl">
                        <div className="flex items-center gap-1 text-blue-600 mb-1">
                          <Clock size={16} />
                          <span className="text-xs font-semibold uppercase">
                            Thời gian
                          </span>
                        </div>
                        <span className="text-slate-700 font-bold">
                          {trip.total_days} Ngày
                        </span>
                      </div>
                      <div className="bg-green-50 p-3 rounded-xl">
                        <div className="flex items-center gap-1 text-green-600 mb-1">
                          <Banknote size={16} />
                          <span className="text-xs font-semibold uppercase">
                            Chi phí
                          </span>
                        </div>
                        <span className="text-slate-700 font-bold text-sm">
                          {trip.total_cost
                            ? formatCurrency(trip.total_cost)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                    <span className="text-xs text-gray-400">
                      Đã lưu thành công
                    </span>
                    <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      Xem chi tiết <ArrowRight size={16} className="ml-1" />
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
                    ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm font-medium text-gray-600">
                Trang{" "}
                <span className="text-blue-600 font-bold">{currentPage}</span> /{" "}
                {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full border transition ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-blue-600"
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