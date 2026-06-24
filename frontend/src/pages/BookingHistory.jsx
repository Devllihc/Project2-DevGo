import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarBlank,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  X,
  PencilSimple,
  WarningCircle
} from "@phosphor-icons/react";

const BookingHistory = () => {
  const { token, backendUrl } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Modals state
  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null });
  const [editModal, setEditModal] = useState({ open: false, booking: null });

  // Form states
  const [cancellationReason, setCancellationReason] = useState("");
  const [editTravelers, setEditTravelers] = useState(1);
  const [editStartDate, setEditStartDate] = useState("");

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setBookings(response.data.bookings);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(error.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token, backendUrl]);

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!cancellationReason.trim()) {
      toast.warning("Please enter a reason for cancellation");
      return;
    }
    try {
      const response = await axios.put(
        `${backendUrl}/api/bookings/${cancelModal.bookingId}/cancel`,
        { cancellationReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Tour cancelled successfully");
        setCancelModal({ open: false, bookingId: null });
        setCancellationReason("");
        fetchBookings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error cancelling tour");
    }
  };

  const handleEditBooking = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${backendUrl}/api/bookings/${editModal.booking._id}/edit`,
        { travelers: editTravelers, startDate: editStartDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Update successful");
        setEditModal({ open: false, booking: null });
        fetchBookings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating");
    }
  };

  const openEditModal = (booking) => {
    setEditModal({ open: true, booking });
    setEditTravelers(booking.travelers);
    setEditStartDate(booking.startDate || "");
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const filteredBookings = bookings.filter(
    (b) => activeTab === "all" || b.status === activeTab
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock weight="bold" /> Pending
          </span>
        );
      case "confirmed":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle weight="bold" /> Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <CheckCircle weight="bold" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle weight="bold" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-white mb-2">
            Booking History
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            Manage and track your trips
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 border-b border-stone-200 dark:border-stone-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 dark:border-white"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
          <CalendarBlank className="w-12 h-12 text-stone-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-stone-900 dark:text-white mb-1">
            No trips found
          </h3>
          <p className="text-stone-500 dark:text-stone-400">
            You have no bookings in this category.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Info */}
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                        #{booking._id.slice(-6)}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-white line-clamp-2">
                      {booking.tourTitle}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-stone-600 dark:text-stone-400">
                    <div>
                      <span className="block text-stone-400 text-xs mb-1 uppercase tracking-wider font-semibold">Departure</span>
                      <div className="flex items-center gap-1.5 font-medium text-stone-900 dark:text-stone-300">
                        <CalendarBlank /> {booking.startDate || "Not selected"}
                      </div>
                    </div>
                    <div>
                      <span className="block text-stone-400 text-xs mb-1 uppercase tracking-wider font-semibold">Travelers</span>
                      <div className="flex items-center gap-1.5 font-medium text-stone-900 dark:text-stone-300">
                        <Users /> {booking.travelers} {booking.travelers > 1 ? "people" : "person"}
                      </div>
                    </div>
                    <div>
                      <span className="block text-stone-400 text-xs mb-1 uppercase tracking-wider font-semibold">Booked On</span>
                      <div className="font-medium text-stone-900 dark:text-stone-300">
                        {new Date(booking.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions & Price */}
                <div className="flex flex-row md:flex-col justify-between items-end gap-4 border-t md:border-t-0 md:border-l border-stone-100 dark:border-stone-800 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                  <div className="text-left md:text-right w-full">
                    <span className="block text-stone-400 text-xs mb-1 uppercase tracking-wider font-semibold">Total Price</span>
                    <div className="text-2xl font-bold text-accent-500">
                      ${booking.totalPrice}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full justify-end">
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => openEditModal(booking)}
                          className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                          title="Edit"
                        >
                          <PencilSimple size={18} weight="bold" />
                        </button>
                        <button
                          onClick={() => setCancelModal({ open: true, bookingId: booking._id })}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                        >
                          Cancel Tour
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">Confirm Cancellation</h3>
                <button onClick={() => setCancelModal({ open: false, bookingId: null })} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                  <X size={20} weight="bold" />
                </button>
              </div>
              <form onSubmit={handleCancelBooking} className="p-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 p-4 rounded-xl flex gap-3 mb-6">
                  <WarningCircle size={24} weight="fill" className="shrink-0" />
                  <p className="text-sm">
                    Note: Cancellations made 2 days prior to departure will be 100% refunded. Cancellations within 2 days are non-refundable.
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                    Reason for cancellation *
                  </label>
                  <textarea
                    required
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none resize-none h-28"
                    placeholder="Please tell us why..."
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setCancelModal({ open: false, bookingId: null })}
                    className="px-5 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">Edit Information</h3>
                <button onClick={() => setEditModal({ open: false, booking: null })} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                  <X size={20} weight="bold" />
                </button>
              </div>
              <form onSubmit={handleEditBooking} className="p-6">
                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                      Departure Date
                    </label>
                    {editModal.booking?.availableDates && editModal.booking.availableDates.length > 0 ? (
                      <select
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none"
                      >
                        <option value="" disabled>Select a date</option>
                        {editModal.booking.availableDates.map((date, idx) => (
                          <option key={idx} value={date}>{date}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                      Number of Travelers
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editTravelers}
                      onChange={(e) => setEditTravelers(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditModal({ open: false, booking: null })}
                    className="px-5 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-medium bg-accent-500 text-white hover:bg-accent-600 transition-colors shadow-sm shadow-accent-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BookingHistory;
