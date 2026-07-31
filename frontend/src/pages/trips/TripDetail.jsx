import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import {
  MapPin,
  Banknote,
  Calendar,
  ArrowLeft,
  Car,
  Footprints,
  Share2,
  Download,
  Clock,
  AlertCircle,
  Map,
  Compass,
  Star,
  FileText,
  CalendarPlus,
  FileSpreadsheet,
  Printer
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

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
      const itinerary = trip.itinerary_details || trip.itinerary || [];

      excelRows.push({ "Cột A": "TÊN CHUYẾN ĐI:", "Cột B": trip.trip_name });
      excelRows.push({ "Cột A": "TỔNG NGÀY:", "Cột B": trip.total_days });
      excelRows.push({
        "Cột A": "TỔNG CHI PHÍ:",
        "Cột B": formatCurrency(trip.total_cost || 0),
      });
      excelRows.push({});

      itinerary.forEach((dayItem) => {
        excelRows.push({ "Cột A": `--- NGÀY ${dayItem.day} ---` });

        dayItem.activities.forEach((act) => {
          const timeString = act.time || `${act.start_time || "?"} - ${act.end_time || "?"}`;

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
        excelRows.push({}); 
      });

      const worksheet = XLSX.utils.json_to_sheet(excelRows);

      worksheet["!cols"] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 40 },
        { wch: 40 },
        { wch: 15 },
        { wch: 15 },
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Đã copy link! Hãy gửi cho bạn bè nhé.", { position: "top-center" });
    } catch (err) {
      toast.error("Không thể copy link.");
    }
  };

  // --- XỬ LÝ XUẤT PDF ---
  const handleDownloadPDF = () => {
    if (!trip) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Vui lòng cho phép mở popup trình duyệt để tải file PDF.");
      return;
    }

    const itinerary = trip.itinerary_details || trip.itinerary || [];

    const contentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lịch Trình Du Lịch - ${trip.trip_name || "DevGo Trip"}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px; color: #1c1917; background-color: #ffffff; }
          .header { border-bottom: 2px solid #f97316; padding-bottom: 16px; margin-bottom: 24px; }
          .badge { display: inline-block; background-color: #fff7ed; color: #c2410c; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
          .title { font-size: 28px; font-weight: 800; color: #0c0a09; margin: 0 0 10px 0; }
          .meta-grid { display: flex; gap: 20px; font-size: 14px; color: #57534e; margin-bottom: 8px; }
          .meta-item { font-weight: 600; }
          .prompt { font-style: italic; color: #78716c; font-size: 13px; margin-top: 6px; }
          .day-title { background: #fff7ed; border-left: 4px solid #f97316; padding: 8px 14px; font-size: 18px; font-weight: 700; color: #9a3412; margin: 24px 0 12px 0; border-radius: 4px; }
          .activity-card { border: 1px solid #e7e5e4; padding: 14px 18px; margin-bottom: 12px; border-radius: 12px; page-break-inside: avoid; background-color: #fafaf9; }
          .act-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
          .act-name { font-size: 16px; font-weight: 700; color: #1c1917; }
          .act-time { font-size: 12px; font-weight: 700; color: #ea580c; background-color: #ffedd5; padding: 3px 8px; border-radius: 6px; }
          .act-cost { font-size: 12px; font-weight: 700; color: #15803d; background-color: #dcfce7; padding: 3px 8px; border-radius: 6px; }
          .act-notes { font-size: 13px; color: #44403c; margin-top: 6px; background-color: #ffffff; padding: 8px 12px; border-radius: 6px; border-left: 3px solid #fdba74; }
          .act-detail { font-size: 12px; color: #78716c; margin-top: 6px; display: flex; gap: 16px; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="badge">DevGo Travel Itinerary</div>
          <h1 class="title">${trip.trip_name || "Lịch Trình Du Lịch"}</h1>
          <div class="meta-grid">
            <div class="meta-item">🗓️ Thời lượng: ${trip.total_days} ngày</div>
            <div class="meta-item">💰 Ước tính chi phí: ${formatCurrency(trip.total_cost || 0)}</div>
          </div>
          ${trip.prompt ? `<div class="prompt">Yêu cầu: "${trip.prompt}"</div>` : ""}
        </div>

        ${itinerary.map((day) => `
          <div class="day-title">Ngày ${day.day}</div>
          ${(day.activities || []).map((act) => `
            <div class="activity-card">
              <div class="act-header">
                <span class="act-time">⏰ ${act.time || `${act.start_time || "?"} - ${act.end_time || "?"}`}</span>
                <span class="act-cost">${act.cost_vnd ? formatCurrency(act.cost_vnd) : "Miễn phí"}</span>
              </div>
              <div class="act-name">${act.activity_name}</div>
              ${act.notes ? `<div class="act-notes">${act.notes}</div>` : ""}
              <div class="act-detail">
                ${act.address ? `<span>📍 ${act.address}</span>` : ""}
                <span>🚗 ${act.transport || "Tự túc"}${act.distance_km ? ` (${act.distance_km} km)` : ""}</span>
              </div>
            </div>
          `).join("")}
        `).join("")}

        <div class="footer">
          Được tạo bởi DevGo Platform • ${new Date().toLocaleDateString("vi-VN")}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(contentHtml);
    printWindow.document.close();
    toast.success("Đã mở cửa sổ in/xuất PDF!");
  };

  // --- XỬ LÝ XUẤT ICAL (.ICS) ---
  const handleDownloadICS = () => {
    if (!trip) return;
    try {
      const itinerary = trip.itinerary_details || trip.itinerary || [];
      const baseDate = new Date();
      let eventsStr = "";

      const formatICSDate = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      itinerary.forEach((dayItem) => {
        const dayNum = dayItem.day || 1;
        const dayDate = new Date(baseDate);
        dayDate.setDate(baseDate.getDate() + (dayNum - 1));

        (dayItem.activities || []).forEach((act, idx) => {
          const startTime = new Date(dayDate);
          startTime.setHours(9 + idx * 2, 0, 0);
          const endTime = new Date(startTime);
          endTime.setHours(startTime.getHours() + 1);

          const uid = `devgo-${trip._id || Date.now()}-${dayNum}-${idx}@devgo.com`;
          const summary = (act.activity_name || "Hoạt động du lịch").replace(/\n/g, " ");
          const description = (act.notes || `Chuyến đi ${trip.trip_name || ""}`).replace(/\n/g, " ");
          const location = (act.address || "").replace(/\n/g, " ");

          eventsStr += `BEGIN:VEVENT\r\nUID:${uid}\r\nSUMMARY:${summary}\r\nDESCRIPTION:${description}\r\nLOCATION:${location}\r\nDTSTART:${formatICSDate(startTime)}\r\nDTEND:${formatICSDate(endTime)}\r\nEND:VEVENT\r\n`;
        });
      });

      const icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//DevGo Travel Planner//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:${trip.trip_name || "Lịch Trình DevGo"}\r\n${eventsStr}END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      saveAs(blob, `Lich_Trinh_${(trip.trip_name || "Du_Lich").replace(/\s+/g, "_")}.ics`);
      toast.success("Đã tải file lịch (.ics) thành công!");
    } catch (err) {
      console.error("Lỗi xuất file .ics:", err);
      toast.error("Có lỗi khi xuất file lịch .ics");
    }
  };

  // --- XỬ LÝ THÊM VÀO GOOGLE CALENDAR ---
  const handleAddToGoogleCalendar = (activity, dayNum = 1) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + (dayNum - 1));
    baseDate.setHours(9, 0, 0);

    const endDate = new Date(baseDate);
    endDate.setHours(11, 0, 0);

    const formatGCalDate = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const title = encodeURIComponent(activity.activity_name || "Hoạt động du lịch");
    const details = encodeURIComponent(`${activity.notes || ""}\nPhương tiện: ${activity.transport || "Tự túc"}`);
    const location = encodeURIComponent(activity.address || "");
    const dates = `${formatGCalDate(baseDate)}/${formatGCalDate(endDate)}`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    window.open(url, "_blank");
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-stone-50 dark:bg-stone-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-100 border-t-accent-500"></div>
          <p className="text-stone-500 dark:text-stone-400 font-medium animate-pulse">Loading itinerary details...</p>
        </div>
      </div>
    );

  if (!trip)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-stone-50 dark:bg-stone-950 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-lg border border-stone-100 dark:border-stone-800 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">Trip Not Found</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-8">We couldn't locate the itinerary you're looking for. It might have been deleted or the link is invalid.</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold py-3 rounded-xl hover:bg-stone-800 dark:hover:bg-white transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );

  const itineraryList = trip.itinerary_details || trip.itinerary || [];
  const totalCost = trip.total_cost || 0;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20 font-sans selection:bg-accent-500/30">
      {/* 1. HERO HEADER SECTION */}
      <div className="relative overflow-hidden bg-white dark:bg-stone-900 border-b border-stone-200/50 dark:border-stone-800/50 shadow-sm">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gradient-to-br from-accent-400/20 to-accent-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-gradient-to-tr from-amber-400/10 to-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 md:py-10">
          {/* Top Actions */}
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 backdrop-blur-md rounded-xl text-stone-600 dark:text-stone-300 font-bold transition-all border border-stone-200/50 dark:border-stone-700/50 shadow-sm"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleShare}
                className="p-3 bg-white/50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 backdrop-blur-md rounded-xl text-stone-600 dark:text-stone-300 transition-all border border-stone-200/50 dark:border-stone-700/50 shadow-sm hover:text-accent-500 hover:border-accent-500/30"
                title="Share this itinerary"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-3.5 py-2.5 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl text-stone-700 dark:text-stone-200 font-bold transition-all border border-stone-200 dark:border-stone-700 shadow-sm flex items-center gap-2 text-sm"
                title="Export as PDF"
              >
                <FileText size={18} className="text-red-500" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
              <button
                onClick={handleDownloadICS}
                className="px-3.5 py-2.5 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl text-stone-700 dark:text-stone-200 font-bold transition-all border border-stone-200 dark:border-stone-700 shadow-sm flex items-center gap-2 text-sm"
                title="Export .ics calendar"
              >
                <CalendarPlus size={18} className="text-blue-500" />
                <span className="hidden sm:inline">iCal (.ics)</span>
              </button>
              <button
                onClick={handleDownloadExcel}
                className="px-4 py-2.5 bg-accent-500 hover:bg-accent-600 rounded-xl text-white font-bold transition-all shadow-md shadow-accent-500/20 hover:shadow-lg flex items-center gap-2 text-sm"
                title="Download Excel"
              >
                <FileSpreadsheet size={18} />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
            </div>
          </div>

          {/* Title & Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
          >
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-stone-200 dark:border-stone-700">
                  <Compass size={14} /> AI Itinerary
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-stone-900 dark:text-white leading-tight bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-600 dark:from-white dark:to-stone-400">
                {trip.trip_name}
              </h1>
              {trip.prompt && (
                <p className="mt-4 text-stone-500 dark:text-stone-400 leading-relaxed text-lg line-clamp-2">
                  "{trip.prompt}"
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <div className="flex flex-col bg-white/60 dark:bg-stone-800/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-stone-200/50 dark:border-stone-700/50 shadow-sm">
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={12}/> Duration</span>
                <span className="text-xl font-extrabold text-stone-800 dark:text-stone-100">{trip.total_days} Days</span>
              </div>
              <div className="flex flex-col bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 backdrop-blur-xl px-5 py-3 rounded-2xl border border-green-200/50 dark:border-green-800/50 shadow-sm">
                <span className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Banknote size={12}/> Estimated Cost</span>
                <span className="text-xl font-extrabold text-green-700 dark:text-green-400">{formatCurrency(totalCost).replace('₫','').trim()} <span className="text-sm">USD</span></span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: DAY NAVIGATOR */}
        <div className="lg:col-span-3 lg:col-start-1">
          <div className="sticky top-28 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-stone-200/50 dark:border-stone-800/50 p-3 flex flex-col gap-1.5">
            <h3 className="px-4 py-3 text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
              Itinerary Overview
            </h3>
            <div className="flex flex-col max-h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar pr-2">
              {itineraryList.map((dayItem) => {
                const isActive = activeDay === dayItem.day;
                return (
                  <button
                    key={dayItem.day}
                    onClick={() => {
                      setActiveDay(dayItem.day);
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className={`relative text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${
                      isActive
                        ? "bg-accent-50 dark:bg-accent-900/20 border border-accent-100 dark:border-accent-800/50 shadow-sm"
                        : "border border-transparent hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:border-stone-200/50 dark:hover:border-stone-700/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                        isActive ? "bg-accent-500 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-stone-700"
                      }`}>
                        {dayItem.day}
                      </div>
                      <span className={`font-bold transition-colors ${isActive ? "text-accent-700 dark:text-accent-400" : "text-stone-600 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100"}`}>
                        Day {dayItem.day}
                      </span>
                    </div>
                    {isActive && (
                      <motion.div layoutId="activeDayIndicator" className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMELINE DETAILS */}
        <div className="lg:col-span-9 lg:col-start-4 min-h-[500px]">
          <AnimatePresence mode="wait">
            {itineraryList.map((dayItem) => {
              if (activeDay !== dayItem.day) return null;
              
              return (
                <motion.div
                  key={dayItem.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Day Header */}
                  <div className="mb-10 flex items-center gap-4 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/50 p-4 rounded-3xl shadow-sm inline-flex pr-8">
                    <div className="bg-gradient-to-br from-accent-400 to-accent-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md shadow-accent-500/30">
                      {dayItem.day}
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-accent-500 uppercase tracking-widest mb-0.5">Daily Plan</h2>
                      <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">
                        Day {dayItem.day} Itinerary
                      </h3>
                    </div>
                  </div>

                  <div className="relative border-l-2 border-dashed border-stone-200 dark:border-stone-800 ml-7 space-y-12 pb-12">
                    {dayItem.activities?.map((activity, index) => {
                      const displayTime = activity.time || `${activity.start_time} - ${activity.end_time}`;
                      const isFree = activity.cost_vnd === 0;

                      return (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative pl-12 group"
                        >
                          {/* Timeline Dot */}
                          <div className="absolute -left-[11px] top-8 w-5 h-5 rounded-full bg-stone-50 dark:bg-stone-950 border-[5px] border-accent-400 group-hover:scale-125 group-hover:border-accent-500 transition-all duration-300 shadow-sm z-10"></div>
                          <div className="absolute -left-3 top-8 w-9 h-9 rounded-full bg-accent-500/10 scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>

                          {/* Content Card */}
                          <div className="bg-white dark:bg-stone-900 p-7 rounded-3xl border border-stone-100 dark:border-stone-800 hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-black/50 transition-all duration-300 hover:border-stone-200 dark:hover:border-stone-700">
                            
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                              {/* Time Badge */}
                              <div className="inline-flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-4 py-1.5 rounded-xl text-sm font-bold border border-stone-200/50 dark:border-stone-700/50">
                                <Clock size={16} className="text-accent-500" />
                                {displayTime}
                              </div>
                              
                              {/* Cost Badge (Top Right) */}
                              <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold border ${
                                isFree 
                                ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200/50 dark:border-green-800/50" 
                                : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/50"
                              }`}>
                                {isFree ? <Star size={16} /> : <Banknote size={16} />}
                                {isFree ? "Free" : formatCurrency(activity.cost_vnd)}
                              </div>
                            </div>

                            {/* Activity Name */}
                            <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3 leading-tight group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                              {activity.activity_name}
                            </h3>

                            {/* Description / Notes */}
                            {activity.notes && (
                              <p className="text-stone-500 dark:text-stone-400 text-base mb-6 leading-relaxed bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border-l-4 border-accent-200 dark:border-accent-800">
                                {activity.notes}
                              </p>
                            )}

                            <div className="h-px bg-gradient-to-r from-stone-100 via-stone-200 to-transparent dark:from-stone-800 dark:via-stone-700 my-6"></div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                              {/* Address */}
                              {activity.address && (
                                <div className="flex items-start gap-3 col-span-1 md:col-span-2 group/info">
                                  <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-lg group-hover/info:bg-red-50 dark:group-hover/info:bg-red-900/20 transition-colors shrink-0">
                                    <MapPin size={18} className="text-stone-400 group-hover/info:text-red-500 transition-colors" />
                                  </div>
                                  <span className="font-semibold text-stone-600 dark:text-stone-300 mt-1.5">
                                    {activity.address}
                                  </span>
                                </div>
                              )}

                              {/* Transport */}
                              <div className="flex items-center gap-3 group/info">
                                <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-lg group-hover/info:bg-accent-50 dark:group-hover/info:bg-accent-900/20 transition-colors shrink-0">
                                  {activity.transport?.toLowerCase().includes("bộ") ? (
                                    <Footprints size={18} className="text-stone-400 group-hover/info:text-orange-500 transition-colors" />
                                  ) : (
                                    <Car size={18} className="text-stone-400 group-hover/info:text-accent-500 transition-colors" />
                                  )}
                                </div>
                                <span className="font-semibold text-stone-600 dark:text-stone-300">
                                  {activity.transport || "Self-guided"}
                                  {activity.distance_km ? <span className="text-stone-400 dark:text-stone-500 font-medium ml-1">({activity.distance_km} km)</span> : ""}
                                </span>
                              </div>

                              {/* Google Calendar Sync */}
                              <div className="flex items-center justify-end col-span-1 md:col-span-2 mt-2">
                                <button
                                  onClick={() => handleAddToGoogleCalendar(activity, dayItem.day)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-200/50 dark:border-blue-800/50 transition-all shadow-sm active:scale-95"
                                  title="Thêm hoạt động này vào Google Calendar"
                                >
                                  <CalendarPlus size={14} />
                                  <span>Add to Google Calendar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
