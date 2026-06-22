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
    duration: "3 days 2 nights",
    budget: "Medium",
    requirements: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const durationOptions = [
    "1 day",
    "2 days 1 night",
    "3 days 2 nights",
    "4 days 3 nights",
    "5 days 4 nights",
    "More than 5 days",
  ];
  const budgetOptions = ["Budget", "Medium", "Luxury"];

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
      toast.info("Please login to use this feature.");

      navigate("/login", { state: { from: location } });
      return
    }

    if (!formData.destination.trim()) {
      return toast.warning("Where are you going? Please enter a destination!");
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
        toast.success("Great! Your itinerary is ready.");
        setResult(res.data.data);
      } else {
        toast.error(res.data.message || "An error occurred while generating the itinerary.");
      }
    } catch (err) {
      console.error("Lỗi API:", err);
      const errorMsg =
        err.response?.data?.message ||
        "AI system is busy, please try again later.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 font-sans min-h-screen">
      {/* HEADER SECTION */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h2 className="text-4xl font-black text-stone-900 dark:text-stone-100 flex items-center justify-center gap-3 mb-2">
          <Plane className="text-accent-500 transform -rotate-12" size={40} />
          <span className="text-accent-500">
            AI Travel Planner
          </span>
        </h2>
        <p className="text-stone-500 dark:text-stone-400 text-lg max-w-2xl mx-auto">
          Create your own itinerary
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* --- CỘT TRÁI: FORM NHẬP LIỆU --- */}
        <div className="lg:col-span-4 sticky top-28 z-10">
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800">
            <h3 className="font-bold text-stone-800 dark:text-stone-200 text-xl mb-6 flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-4">
              <Sparkles className="text-amber-500" size={22} /> Setup Itinerary
            </h3>

            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Điểm đến */}
              <div className="group relative">
                {" "}
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                  Destination <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3.5 text-stone-400 dark:text-stone-500 group-focus-within:text-accent-500 transition-colors"
                    size={18}
                  />
                  <input
                    name="destination"
                    value={formData.destination}
                    onChange={handleDestinationChange}
                    onFocus={() => {
                      if (formData.destination) setShowSuggestions(true);
                    }}
                    placeholder="Enter province/city name..."
                    className="w-full pl-10 p-3.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:bg-white dark:focus:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-accent-500 outline-none transition-all font-medium"
                    required
                    autoComplete="off"
                  />

                  {/* Dropdown Gợi ý */}
                  {showSuggestions && filteredProvinces.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white dark:bg-stone-900 mt-2 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                      {filteredProvinces.map((province, index) => (
                        <li
                          key={index}
                          onClick={() => selectSuggestion(province)}
                          className="px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer text-stone-700 dark:text-stone-300 font-medium border-b border-stone-50 dark:border-stone-800 last:border-0 flex items-center gap-2 transition-colors"
                        >
                          <MapPin size={14} className="text-stone-400 dark:text-stone-500" />
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
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                    Duration
                  </label>
                  <div className="relative">
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-accent-500 outline-none cursor-pointer font-medium appearance-none"
                    >
                      {durationOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <Calendar
                      className="absolute right-3 top-3.5 text-stone-400 dark:text-stone-500 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                    Budget
                  </label>
                  <div className="relative">
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-accent-500 outline-none cursor-pointer font-medium appearance-none"
                    >
                      {budgetOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <Banknote
                      className="absolute right-3 top-3.5 text-stone-400 dark:text-stone-500 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>
              </div>

              {/* Yêu cầu đặc biệt */}
              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                  Special Requirements
                </label>
                <div className="relative">
                  <FileEdit
                    className="absolute left-3 top-3.5 text-stone-400 dark:text-stone-500"
                    size={18}
                  />
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="Ex: Love photography, vegetarian, traveling with kids..."
                    className="w-full pl-10 p-4 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-2xl h-28 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-accent-500 outline-none resize-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex justify-center items-center gap-3 
                  ${
                    loading
                      ? "bg-stone-300 dark:bg-stone-700 cursor-not-allowed text-stone-500 dark:text-stone-400"
                      : "bg-accent-500 hover:bg-accent-600 text-white hover:-translate-y-1"
                  }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                {loading ? "AI is thinking..." : "Generate Itinerary"}
              </button>
            </form>
          </div>
        </div>

        {/* --- CỘT PHẢI: HIỂN THỊ KẾT QUẢ --- */}
        <div className="lg:col-span-8">
          {!result ? (
            // EMPTY STATE
            <div className="h-[600px] flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800">
              <div
                className={`w-24 h-24 bg-accent-500/10 rounded-full flex items-center justify-center mb-6 transition-all ${
                  loading ? "scale-110" : ""
                }`}
              >
                {loading ? (
                  <Loader2 size={48} className="text-accent-500 animate-spin" />
                ) : (
                  <Navigation
                    size={48}
                    className="text-accent-300 animate-bounce"
                  />
                )}
              </div>
              <h4 className="text-xl font-bold text-stone-600 dark:text-stone-300">
                {loading
                  ? "Connecting to AI expert..."
                  : "Ready to explore?"}
              </h4>
              <p className="mt-2 text-stone-400 dark:text-stone-500 text-center max-w-sm">
                {loading
                  ? "Please wait a moment, we are searching for the best places from Google."
                  : "Fill in the information on the left and click the button to get a detailed itinerary."}
              </p>
            </div>
          ) : (
            // RESULT CONTENT
            <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Result Header */}
              <div className="bg-stone-900 p-8 md:p-10 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 p-10 opacity-5 uppercase font-black text-9xl pointer-events-none select-none">
                  TRIP
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                    {result.trip_name}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/20 transition">
                      <Calendar size={18} className="text-accent-400" />
                      <span className="font-bold">
                        {result.total_days} Days
                      </span>
                    </div>
                    <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/20 transition">
                      <Banknote size={18} className="text-emerald-400" />
                      <span className="font-bold">
                        {formatCurrency(result.total_cost)} / person
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Body */}
              <div className="p-6 md:p-10 bg-stone-50 dark:bg-stone-950">
                {result.itinerary_details &&
                result.itinerary_details.length > 0 ? (
                  result.itinerary_details.map((dayData, dIdx) => (
                    <div key={dIdx} className="mb-12 last:mb-0">
                      {/* Day Marker */}
                      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-stone-50/95 dark:bg-stone-950/95 py-4 z-10 backdrop-blur-sm">
                        <div className="w-12 h-12 bg-accent-500 rounded-2xl flex items-center justify-center text-white font-black text-xl transform rotate-3">
                          {dayData.day}
                        </div>
                        <h3 className="text-2xl font-black text-stone-800 dark:text-stone-100">
                          Day {dayData.day}
                        </h3>
                      </div>

                      {/* Activities List */}
                      <div className="ml-6 border-l border-dashed border-stone-300 dark:border-stone-700 pl-8 md:pl-12 space-y-8 pb-4">
                        {dayData.activities?.map((act, aIdx) => (
                          <div key={aIdx} className="relative group">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[41px] md:-left-[57px] top-0 w-6 h-6 bg-white dark:bg-stone-900 border-4 border-accent-500 rounded-full group-hover:scale-125 transition-transform" />

                            {/* Card */}
                            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                              {/* Activity Header */}
                              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                <h4 className="text-xl font-bold text-stone-800 dark:text-stone-100 group-hover:text-accent-500 transition-colors leading-snug">
                                  {act.activity_name}
                                </h4>
                                <div className="flex flex-col items-end shrink-0">
                                  <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-full text-stone-600 dark:text-stone-300 font-bold text-xs border border-stone-200 dark:border-stone-700">
                                    <Clock size={14} /> {act.start_time} -{" "}
                                    {act.end_time}
                                  </div>
                                  {act.duration_hours && (
                                    <span className="text-[10px] text-stone-400 mt-1 uppercase tracking-wider font-bold flex items-center gap-1">
                                      <Clock size={10} /> ~{act.duration_hours}{" "}
                                      hours
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Details Grid */}
                              <div className="space-y-4">
                                {/* Address */}
                                <div className="flex items-start gap-3 text-stone-600 dark:text-stone-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-50 dark:border-red-900/30">
                                  <MapPin
                                    size={18}
                                    className="text-rose-500 shrink-0 mt-0.5"
                                  />
                                  <p className="text-sm font-medium leading-relaxed">
                                    {act.address || "No specific address"}
                                  </p>
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                                    <Banknote
                                      size={16}
                                      className="text-emerald-500"
                                    />
                                    <span className="font-bold">
                                      {act.cost_vnd > 0
                                        ? formatCurrency(act.cost_vnd)
                                        : "Free"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                                    {act.transport
                                      ?.toLowerCase()
                                      .includes("walk") ? (
                                      <Footprints
                                        size={16}
                                        className="text-orange-500"
                                      />
                                    ) : (
                                      <Car
                                        size={16}
                                        className="text-accent-500"
                                      />
                                    )}
                                    <span className="font-medium">
                                      {act.transport || "Self-arranged"}
                                      {act.distance_km
                                        ? ` • ${act.distance_km}km`
                                        : ""}
                                    </span>
                                  </div>
                                </div>

                                {/* Description */}
                                {act.description && (
                                  <div className="mt-2 flex gap-3 items-start p-3 rounded-xl bg-accent-50/30 border border-accent-100">
                                    <Info
                                      size={16}
                                      className="text-accent-500 mt-0.5 shrink-0"
                                    />
                                    <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed italic">
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
                      No itinerary details found. Please try again.
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
