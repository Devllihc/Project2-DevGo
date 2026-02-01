import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import {
  MapPin,
  Banknote,
  Calendar,
  ArrowLeft,
  Car,
  Footprints,
  Share2,
  Download,
  Clock, // Import thêm Clock
  AlertCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  useEffect(() => {
    const fetchTripDetail = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backendUrl}/api/planner/trip/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setTrip(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
        toast.error("Không thể tải chi tiết chuyến đi.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTripDetail();
  }, [id, token]);

  // --- XỬ LÝ DOWNLOAD EXCEL ---
  const handleDownloadExcel = () => {
    if (!trip) return;

    try {
      const excelRows = [];
      // Fallback: Nếu dữ liệu cũ dùng 'itinerary', dữ liệu mới dùng 'itinerary_details'
      const itinerary = trip.itinerary_details || trip.itinerary || [];

      // Header thông tin chung
      excelRows.push({ "Cột A": "TÊN CHUYẾN ĐI:", "Cột B": trip.trip_name });
      excelRows.push({ "Cột A": "TỔNG NGÀY:", "Cột B": trip.total_days });
      excelRows.push({
        "Cột A": "TỔNG CHI PHÍ:",
        "Cột B": formatCurrency(trip.total_cost || 0),
      });
      excelRows.push({}); // Dòng trống

      // Header bảng chi tiết
      // (Ta dùng key tiếng Việt để xuất ra file Excel cho đẹp)
      itinerary.forEach((dayItem) => {
        // Tiêu đề ngày
        excelRows.push({ "Cột A": `--- NGÀY ${dayItem.day} ---` });

        dayItem.activities.forEach((act) => {
          // Xử lý thời gian: Ưu tiên 'time', nếu không có thì ghép start - end
          const timeString =
            act.time || `${act.start_time || "?"} - ${act.end_time || "?"}`;

          excelRows.push({
            Ngày: `Ngày ${dayItem.day}`,
            "Thời gian": timeString,
            "Hoạt động": act.activity_name,
            "Địa chỉ": act.address || "N/A",
            "Phương tiện": act.transport || "-",
            "Chi phí (VND)": act.cost_vnd || 0,
            "Ghi chú": act.notes || "",
          });
        });
        excelRows.push({}); // Dòng trống giữa các ngày
      });

      const worksheet = XLSX.utils.json_to_sheet(excelRows);

      // Chỉnh độ rộng cột
      worksheet["!cols"] = [
        { wch: 10 }, // Ngày
        { wch: 20 }, // Thời gian
        { wch: 40 }, // Hoạt động
        { wch: 40 }, // Địa chỉ
        { wch: 15 }, // Phương tiện
        { wch: 15 }, // Chi phí
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Lịch Trình");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      saveAs(data, `Lich_Trinh_${trip.trip_name || "Du_Lich"}.xlsx`);
      toast.success("Đã tải xuống file Excel!");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi xuất file Excel.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!trip)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <p className="text-gray-600 font-medium">
          Không tìm thấy dữ liệu chuyến đi.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 hover:underline"
        >
          Quay lại trang chủ
        </button>
      </div>
    );

  const itineraryList = trip.itinerary_details || trip.itinerary || [];
  const totalCost = trip.total_cost || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* 1. HEADER SECTION */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition font-medium"
          >
            <ArrowLeft size={20} className="mr-1" /> Quay lại
          </button>
          <div className="flex gap-2">
            <button
              className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition"
              title="Chia sẻ"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={handleDownloadExcel}
              className="p-2.5 bg-blue-50 rounded-full hover:bg-blue-100 text-blue-600 transition flex items-center gap-2"
              title="Tải Excel"
            >
              <Download size={18} />{" "}
              <span className="text-xs font-bold hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>

        {/* Title & Summary */}
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 mb-4 leading-tight">
            {trip.trip_name}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
              <Calendar size={18} /> {trip.total_days} Ngày
            </div>
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-100 shadow-sm">
              <Banknote size={18} /> {formatCurrency(totalCost)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: DAY NAVIGATOR (Sticky Sidebar) */}
        <div className="lg:col-span-3">
          <div className="sticky top-40 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 uppercase text-xs tracking-wider">
              Mục lục ngày
            </div>
            <div className="flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
              {itineraryList.map((dayItem) => (
                <button
                  key={dayItem.day}
                  onClick={() => {
                    setActiveDay(dayItem.day);
                    // Scroll nhẹ đến phần nội dung (tuỳ chọn)
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-left px-5 py-4 border-l-4 transition-all flex justify-between items-center ${
                    activeDay === dayItem.day
                      ? "border-blue-500 bg-blue-50/50 text-blue-700 font-bold"
                      : "border-transparent hover:bg-gray-50 text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <span>Ngày {dayItem.day}</span>
                  {activeDay === dayItem.day && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMELINE DETAILS */}
        <div className="lg:col-span-9 min-h-[500px]">
          {itineraryList.map((dayItem) => (
            <div
              key={dayItem.day}
              className={`${
                activeDay === dayItem.day ? "block" : "hidden"
              } animate-fadeIn duration-500`}
            >
              {/* Day Header */}
              <div className="mb-8 flex items-center gap-4">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-200">
                  {dayItem.day}
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Lịch trình chi tiết Ngày {dayItem.day}
                </h2>
              </div>

              <div className="relative border-l-2 border-dashed border-gray-200 ml-6 space-y-10 pb-10">
                {dayItem.activities?.map((activity, index) => {
                  // Xử lý hiển thị thời gian linh hoạt (quan trọng)
                  const displayTime =
                    activity.time ||
                    `${activity.start_time} - ${activity.end_time}`;

                  return (
                    <div key={index} className="relative pl-10 group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[11px] top-6 w-5 h-5 rounded-full bg-white border-4 border-blue-500 group-hover:scale-125 transition-transform duration-300"></div>

                      {/* Content Card */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        {/* Time Badge */}
                        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
                          <Clock size={14} />
                          {displayTime}
                        </div>

                        {/* Activity Name */}
                        <h3 className="text-xl font-bold text-slate-800 mb-3 leading-snug">
                          {activity.activity_name}
                        </h3>

                        {/* Description / Notes (Nếu có) */}
                        {activity.notes && (
                          <p className="text-gray-500 text-sm mb-4 italic">
                            "{activity.notes}"
                          </p>
                        )}

                        <div className="h-px bg-gray-100 my-4"></div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                          {/* Address */}
                          {activity.address && (
                            <div className="flex items-start gap-2 text-gray-600 col-span-1 sm:col-span-2">
                              <MapPin
                                size={18}
                                className="mt-0.5 text-red-500 shrink-0"
                              />
                              <span className="font-medium text-gray-700">
                                {activity.address}
                              </span>
                            </div>
                          )}

                          {/* Transport */}
                          <div className="flex items-center gap-2 text-gray-600">
                            {activity.transport
                              ?.toLowerCase()
                              .includes("bộ") ? (
                              <Footprints
                                size={18}
                                className="text-orange-500 shrink-0"
                              />
                            ) : (
                              <Car
                                size={18}
                                className="text-blue-500 shrink-0"
                              />
                            )}
                            <span>
                              {activity.transport || "Di chuyển tự túc"}
                              {activity.distance_km
                                ? ` (${activity.distance_km} km)`
                                : ""}
                            </span>
                          </div>

                          {/* Cost */}
                          <div className="flex items-center gap-2 text-gray-600 justify-end">
                            <Banknote
                              size={18}
                              className="text-green-600 shrink-0"
                            />
                            <span
                              className={
                                activity.cost_vnd > 0
                                  ? "font-bold text-green-700"
                                  : "text-gray-500 font-medium"
                              }
                            >
                              {activity.cost_vnd > 0
                                ? formatCurrency(activity.cost_vnd)
                                : "Miễn phí / Đã bao gồm"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
