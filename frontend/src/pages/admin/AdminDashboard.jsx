import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const AdminDashboard = () => {
  const location = useLocation();

  const navItems = [
    { path: "users", label: "User Management" },
    { path: "bookings", label: "Booking Management" },
    { path: "tours", label: "Tour Management" },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 p-6">
        <h2 className="text-xl font-bold mb-6 text-stone-900 dark:text-stone-100">Admin Dashboard</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded-xl transition-colors ${
                location.pathname.includes(item.path)
                  ? "bg-accent-500 text-white"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
