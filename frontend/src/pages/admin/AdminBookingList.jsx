import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import { Search, Map, Clock, Users, CreditCard, CheckCircle, Clock3, XCircle, CalendarDays } from "lucide-react";
import { toast } from "react-toastify";

const AdminBookingList = () => {
  const { token } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const isSearching = Boolean(searchTerm.trim());

  // "All bookings" uses cursor-based (keyset) pagination — fetching the next
  // batch costs the same regardless of how deep an admin has scrolled, unlike
  // skip/limit. Search results come from a separately filtered, much smaller
  // set, so that path keeps simple page-number pagination.
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchPages, setSearchPages] = useState(1);

  const fetchBookings = async (cursor = null) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/all`, {
        params: { limit: 20, ...(cursor ? { cursor } : {}) },
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings((prev) => (cursor ? [...prev, ...(res.data.bookings || [])] : res.data.bookings || []));
      setNextCursor(res.data.nextCursor || null);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  const searchBookings = async (term, pageToLoad = 1) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/search`, {
        params: { query: term, page: pageToLoad, limit: 20 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.bookings || []);
      setSearchPage(res.data.page || 1);
      setSearchPages(res.data.pages || 1);
    } catch (err) {
      console.error("Failed to search bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Debounce search-as-you-type against the backend instead of filtering an incomplete local page
  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchTerm.trim()) {
        searchBookings(searchTerm.trim(), 1);
      } else {
        fetchBookings();
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchBookings(nextCursor);
    setLoadingMore(false);
  };

  const refreshCurrentView = () => {
    if (isSearching) {
      searchBookings(searchTerm.trim(), searchPage);
    } else {
      fetchBookings();
    }
  };

  const handleUpdateStatus = async (id, newStatus, currentPaymentStatus) => {
    try {
      let payload = { status: newStatus };
      // Nếu admin đổi sang cancelled và đã thanh toán, gợi ý đã hoàn tiền
      if (newStatus === "cancelled" && currentPaymentStatus === "paid") {
        payload.paymentStatus = "refunded";
      }

      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/${id}/status`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("Cập nhật trạng thái thành công");
        refreshCurrentView();
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const filteredBookings = bookings;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Booking Management</h2>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Review and track all tour bookings.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or tour..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-all dark:text-stone-100"
          />
        </div>
      </div>

      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
            <thead className="bg-stone-50/50 dark:bg-stone-950/50 border-b border-stone-200 dark:border-stone-800 font-medium">
              <tr>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Tour Information</th>
                <th className="px-6 py-4">Departure</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Booked On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={b._id} 
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{b.name}</div>
                      <div className="text-stone-500 dark:text-stone-400 text-xs mt-1">{b.email}</div>
                      <div className="text-stone-500 dark:text-stone-400 text-xs">{b.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Map className="w-4 h-4 text-accent-500" />
                        {b.tourTitle}
                      </div>
                      <div className="text-stone-500 dark:text-stone-400 text-xs mt-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {b.travelers} traveler{b.travelers > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap">
                        <CalendarDays className="w-4 h-4 text-stone-400" />
                        {b.startDate || "Not specified"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-stone-900 dark:text-stone-100">
                        <CreditCard className="w-4 h-4 text-stone-400" />
                        ${b.totalPrice?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : b.status === 'completed'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : b.status === 'cancelled'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {b.status === 'confirmed' || b.status === 'completed' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : b.status === 'cancelled' ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock3 className="w-3.5 h-3.5" />
                        )}
                        {b.status?.charAt(0).toUpperCase() + b.status?.slice(1) || 'Pending'}
                      </span>
                      {b.cancellationReason && (
                        <div className="mt-2 text-xs text-red-500 max-w-[150px] truncate" title={b.cancellationReason}>
                          Lý do: {b.cancellationReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                        <Clock className="w-4 h-4" />
                        {new Date(b.createdAt).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={b.status}
                        onChange={(e) => handleUpdateStatus(b._id, e.target.value, b.paymentStatus)}
                        className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm rounded-lg focus:ring-accent-500 focus:border-accent-500 block w-full p-2"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="inline-flex flex-col items-center justify-center text-stone-400">
                      <Search className="w-12 h-12 mb-3 opacity-20" />
                      <p>No bookings found matching "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isSearching && searchPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={() => searchBookings(searchTerm.trim(), searchPage - 1)}
              disabled={searchPage <= 1}
              className="px-4 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-stone-500 dark:text-stone-400">Page {searchPage} of {searchPages}</span>
            <button
              onClick={() => searchBookings(searchTerm.trim(), searchPage + 1)}
              disabled={searchPage >= searchPages}
              className="px-4 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
        {!isSearching && nextCursor && (
          <div className="flex items-center justify-center px-6 py-4 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminBookingList;
