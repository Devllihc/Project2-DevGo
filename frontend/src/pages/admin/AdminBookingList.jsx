import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { Search, Map, Clock, Users, CreditCard, CalendarDays } from "lucide-react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminCard from "../../components/admin/AdminCard";
import SearchInput from "../../components/admin/SearchInput";
import StatusBadge from "../../components/admin/StatusBadge";
import PageControls from "../../components/admin/PageControls";

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

  return (
    <div>
      <AdminPageHeader title="Bookings" subtitle="Review and track all tour bookings.">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or tour..."
        />
      </AdminPageHeader>

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
            <thead className="bg-stone-50 dark:bg-stone-950/50 border-b border-stone-200 dark:border-stone-800 font-medium">
              <tr>
                <th className="px-6 py-3">Customer Details</th>
                <th className="px-6 py-3">Tour Information</th>
                <th className="px-6 py-3">Departure</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Booked On</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50">
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/20 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-medium text-stone-900 dark:text-stone-100">{b.name}</div>
                      <div className="text-stone-500 dark:text-stone-400 text-xs mt-1">{b.email}</div>
                      <div className="text-stone-500 dark:text-stone-400 text-xs">{b.phone}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Map className="w-4 h-4 text-accent-500" />
                        {b.tourTitle}
                      </div>
                      <div className="text-stone-500 dark:text-stone-400 text-xs mt-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {b.travelers} traveler{b.travelers > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap">
                        <CalendarDays className="w-4 h-4 text-stone-400" />
                        {b.startDate || "Not specified"}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-stone-900 dark:text-stone-100">
                        <CreditCard className="w-4 h-4 text-stone-400" />
                        ${b.totalPrice?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={b.status} />
                      {b.cancellationReason && (
                        <div className="mt-2 text-xs text-red-500 max-w-[150px] truncate" title={b.cancellationReason}>
                          Lý do: {b.cancellationReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                        <Clock className="w-4 h-4" />
                        {new Date(b.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="inline-flex flex-col items-center justify-center text-stone-400">
                      <Search className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-sm">No bookings found matching "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isSearching ? (
          <PageControls
            mode="pages"
            pages={{
              page: searchPage,
              totalPages: searchPages,
              onPageChange: (nextPage) => searchBookings(searchTerm.trim(), nextPage),
            }}
          />
        ) : (
          <PageControls mode="cursor" cursor={{ hasMore: !!nextCursor, loading: loadingMore, onLoadMore: loadMore }} />
        )}
      </AdminCard>
    </div>
  );
};

export default AdminBookingList;
