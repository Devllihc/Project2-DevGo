import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import { Search, Map, Clock, Users, CreditCard, CheckCircle, Clock3 } from "lucide-react";

const AdminBookingList = () => {
  const { token } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) =>
    [b.name, b.email, b.tourTitle]
      .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Booked On</th>
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
                      <div className="flex items-center gap-1.5 font-semibold text-stone-900 dark:text-stone-100">
                        <CreditCard className="w-4 h-4 text-stone-400" />
                        ${b.totalPrice?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        b.status === 'Confirmed' || b.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {b.status === 'Confirmed' || b.status === 'confirmed' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock3 className="w-3.5 h-3.5" />
                        )}
                        {b.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                        <Clock className="w-4 h-4" />
                        {new Date(b.createdAt).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12">
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
      </div>
    </motion.div>
  );
};

export default AdminBookingList;
