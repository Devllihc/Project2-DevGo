import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { Users, Map, DollarSign, ClipboardList } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminCard from "../../components/admin/AdminCard";
import StatCard from "../../components/admin/StatCard";
import StatusBadge from "../../components/admin/StatusBadge";

const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

const AdminOverview = () => {
  const { token } = useContext(AppContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      }
    };
    fetchStats();
  }, [token]);

  if (!stats) {
    return <div className="text-sm text-stone-500 dark:text-stone-400">Loading overview...</div>;
  }

  return (
    <div>
      <AdminPageHeader title="Overview" subtitle="Snapshot of users, bookings, and tours." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} accent />
        <StatCard icon={Map} label="Total Tours" value={stats.totalTours} />
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} accent />
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-5">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-3">
            <ClipboardList className="w-4 h-4" />
            Bookings by status
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BOOKING_STATUSES.map((status) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {stats.bookingsByStatus[status] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdminCard>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Recent Bookings</h3>
          <Link to="/admin/bookings" className="text-xs font-medium text-accent-600 dark:text-accent-400 hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-stone-800/50">
          {stats.recentBookings.length === 0 ? (
            <div className="p-6 text-sm text-stone-500 dark:text-stone-400">No bookings yet.</div>
          ) : (
            stats.recentBookings.map((b) => (
              <div key={b._id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <div className="text-sm font-medium text-stone-900 dark:text-stone-100">{b.tourTitle}</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">{b.name} &middot; {b.email}</div>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))
          )}
        </div>
      </AdminCard>
    </div>
  );
};

export default AdminOverview;
