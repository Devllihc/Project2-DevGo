import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { vietnamProvinces } from "../assets/data/tour.js";
import {
  Send,
  Loader2,
  MapPin,
  Banknote,
  Clock,
  Sparkles,
  Car,
  Footprints,
  Calendar,
  FileEdit,
  Plane,
  Info,
  Navigation,
  AlertCircle,
} from "lucide-react";

const Planning = () => {
  const { token, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProvinces, setFilteredProvinces ] = useState([]);

  const handleDestinationChange = (e) => {
    const userInput = e.target.value;
    setFormData({ ...formData, destination: userInput });

    if (userInput.length > 0) {
      const filtered = vietnamProvinces.filter((province) =>
        province.toLowerCase().includes(userInput.toLowerCase())
      );
      setFilteredProvinces(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (province) => {
    setFormData({ ...formData, destination: province });
    setShowSuggestions(false);
  };

  const [formData, setFormData] = useState({
    destination: "",
    duration: "3 ngày 2 đêm",
    budget: "Trung bình",
    requirements: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const durationOptions = [
    "1 ngày",
    "2 ngày 1 đêm",
    "3 ngày 2 đêm",
    "4 ngày 3 đêm",
    "5 ngày 4 đêm",
    "Trên 5 ngày",
  ];
  const budgetOptions = ["Tiết kiệm", "Trung bình", "Sang chảnh"];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    // Kiểm tra đăng nhập
    if (!token) {
      toast.info("Vui lòng đăng nhập để sử dụng tính năng này.");

      navigate("/login", { state: { from: location } });
      return
    }

    if (!formData.destination.trim()) {
      return toast.warning("Bạn định đi đâu thế? Hãy nhập điểm đến nhé!");
    }

    setLoading(true);
    setResult(null);

    try {
      console.log(
        "Đang gửi yêu cầu tới:",
        `${backendUrl}/api/planner/generate`
      );

      const res = await axios.post(
        `${backendUrl}/api/planner/generate`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Tuyệt vời! Lịch trình đã sẵn sàng.");
        setResult(res.data.data);
      } else {
        toast.error(res.data.message || "Có lỗi xảy ra khi tạo lịch trình.");
      }
    } catch (err) {
      console.error("Lỗi API:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Hệ thống AI đang bận, vui lòng thử lại sau ít phút.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 font-sans min-h-screen">
      {/* HEADER SECTION */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h2 className="text-4xl font-black text-slate-900 flex items-center justify-center gap-3 mb-2">
          <Plane className="text-blue-600 transform -rotate-12" size={40} />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            AI Travel Planner
          </span>
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Tạo lịch trình cho riêng mình
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* --- CỘT TRÁI: FORM NHẬP LIỆU --- */}
        <div className="lg:col-span-4 sticky top-28 z-10">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 shadow-blue-100/50">
            <h3 className="font-bold text-slate-800 text-xl mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Sparkles className="text-amber-500" size={22} /> Thiết lập hành
              trình
            </h3>

            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Điểm đến */}
              <div className="group relative">
                {" "}
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Điểm đến <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    name="destination"
                    value={formData.destination}
                    onChange={handleDestinationChange}
                    onFocus={() => {
                      if (formData.destination) setShowSuggestions(true);
                    }}
                    placeholder="Nhập tên tỉnh/thành phố..."
                    className="w-full pl-10 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    required
                    autoComplete="off"
                  />

                  {/* Dropdown Gợi ý */}
                  {showSuggestions && filteredProvinces.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white mt-2 rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                      {filteredProvinces.map((province, index) => (
                        <li
                          key={index}
                          onClick={() => selectSuggestion(province)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-slate-700 font-medium border-b border-slate-50 last:border-0 flex items-center gap-2 transition-colors"
                        >
                          <MapPin size={14} className="text-slate-400" />
                          {province}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Thời gian & Ngân sách */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Thời gian
                  </label>
                  <div className="relative">
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-medium appearance-none"
                    >
                      {durationOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <Calendar
                      className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Ngân sách
                  </label>
                  <div className="relative">
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-medium appearance-none"
                    >
                      {budgetOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <Banknote
                      className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>
              </div>

              {/* Yêu cầu đặc biệt */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Yêu cầu đặc biệt
                </label>
                <div className="relative">
                  <FileEdit
                    className="absolute left-3 top-3.5 text-slate-400"
                    size={18}
                  />
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="VD: Thích chụp ảnh, ăn chay, đi cùng trẻ nhỏ..."
                    className="w-full pl-10 p-4 bg-slate-50 border border-slate-200 rounded-2xl h-28 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-3 
                  ${
                    loading
                      ? "bg-slate-300 cursor-not-allowed text-slate-500"
                      : "bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1"
                  }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                {loading ? "AI đang suy nghĩ..." : "Tạo Lịch Trình"}
              </button>
            </form>
          </div>
        </div>

        {/* --- CỘT PHẢI: HIỂN THỊ KẾT QUẢ --- */}
        <div className="lg:col-span-8">
          {!result ? (
            // EMPTY STATE
            <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <div
                className={`w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 transition-all ${
                  loading ? "scale-110" : ""
                }`}
              >
                {loading ? (
                  <Loader2 size={48} className="text-blue-500 animate-spin" />
                ) : (
                  <Navigation
                    size={48}
                    className="text-blue-300 animate-bounce"
                  />
                )}
              </div>
              <h4 className="text-xl font-bold text-slate-600">
                {loading
                  ? "Đang kết nối tới chuyên gia AI..."
                  : "Sẵn sàng khám phá?"}
              </h4>
              <p className="mt-2 text-slate-400 text-center max-w-sm">
                {loading
                  ? "Vui lòng đợi trong giây lát, chúng tôi đang tìm kiếm các địa điểm tốt nhất từ Google."
                  : "Điền thông tin bên trái và nhấn nút để nhận lịch trình chi tiết."}
              </p>
            </div>
          ) : (
            // RESULT CONTENT
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Result Header */}
              <div className="bg-slate-900 p-8 md:p-10 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 p-10 opacity-5 uppercase font-black text-9xl pointer-events-none select-none">
                  TRIP
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                    {result.trip_name}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/20 transition">
                      <Calendar size={18} className="text-blue-400" />
                      <span className="font-bold">
                        {result.total_days} Ngày
                      </span>
                    </div>
                    <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/20 transition">
                      <Banknote size={18} className="text-emerald-400" />
                      <span className="font-bold">
                        {formatCurrency(result.total_cost)} / người
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Body */}
              <div className="p-6 md:p-10 bg-slate-50/50">
                {result.itinerary_details &&
                result.itinerary_details.length > 0 ? (
                  result.itinerary_details.map((dayData, dIdx) => (
                    <div key={dIdx} className="mb-12 last:mb-0">
                      {/* Day Marker */}
                      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-slate-50/95 py-4 z-10 backdrop-blur-sm">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200 transform rotate-3">
                          {dayData.day}
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">
                          Ngày {dayData.day}
                        </h3>
                      </div>

                      {/* Activities List */}
                      <div className="ml-6 border-l-2 border-dashed border-slate-300 pl-8 md:pl-12 space-y-8 pb-4">
                        {dayData.activities?.map((act, aIdx) => (
                          <div key={aIdx} className="relative group">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[45px] md:-left-[61px] top-0 w-6 h-6 bg-white border-4 border-blue-600 rounded-full group-hover:scale-125 transition-transform shadow-sm" />

                            {/* Card */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                              {/* Activity Header */}
                              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                <h4 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                                  {act.activity_name}
                                </h4>
                                <div className="flex flex-col items-end shrink-0">
                                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 font-bold text-xs border border-slate-200">
                                    <Clock size={14} /> {act.start_time} -{" "}
                                    {act.end_time}
                                  </div>
                                  {act.duration_hours && (
                                    <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold flex items-center gap-1">
                                      <Clock size={10} /> ~{act.duration_hours}{" "}
                                      tiếng
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Details Grid */}
                              <div className="space-y-4">
                                {/* Address */}
                                <div className="flex items-start gap-3 text-slate-600 bg-red-50/50 p-3 rounded-xl border border-red-50">
                                  <MapPin
                                    size={18}
                                    className="text-rose-500 shrink-0 mt-0.5"
                                  />
                                  <p className="text-sm font-medium leading-relaxed">
                                    {act.address || "Chưa có địa chỉ cụ thể"}
                                  </p>
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <Banknote
                                      size={16}
                                      className="text-emerald-500"
                                    />
                                    <span className="font-bold">
                                      {act.cost_vnd > 0
                                        ? formatCurrency(act.cost_vnd)
                                        : "Miễn phí"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    {act.transport
                                      ?.toLowerCase()
                                      .includes("bộ") ? (
                                      <Footprints
                                        size={16}
                                        className="text-orange-500"
                                      />
                                    ) : (
                                      <Car
                                        size={16}
                                        className="text-blue-500"
                                      />
                                    )}
                                    <span className="font-medium">
                                      {act.transport || "Tự túc"}
                                      {act.distance_km
                                        ? ` • ${act.distance_km}km`
                                        : ""}
                                    </span>
                                  </div>
                                </div>

                                {/* Description */}
                                {act.description && (
                                  <div className="mt-2 flex gap-3 items-start p-3 rounded-xl bg-blue-50/30 border border-blue-50">
                                    <Info
                                      size={16}
                                      className="text-blue-500 mt-0.5 shrink-0"
                                    />
                                    <p className="text-sm text-slate-600 leading-relaxed italic">
                                      {act.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle
                      className="mx-auto text-yellow-500 mb-2"
                      size={40}
                    />
                    <p className="text-slate-500">
                      Không tìm thấy chi tiết lịch trình. Vui lòng thử lại.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Planning;
