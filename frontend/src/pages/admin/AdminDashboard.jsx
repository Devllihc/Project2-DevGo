import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, CalendarDays, Map, LayoutDashboard } from "lucide-react";

const AdminDashboard = () => {
  const location = useLocation();

  const navItems = [
    { path: "users", label: "Users", icon: <Users size={20} /> },
    { path: "bookings", label: "Bookings", icon: <CalendarDays size={20} /> },
    { path: "tours", label: "Tours", icon: <Map size={20} /> },
  ];

  return (
    <div className="flex min-h-[calc(100vh-7rem)] bg-stone-50 dark:bg-stone-950">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 hidden md:block border-r border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl">
        <div className="sticky top-28 h-[calc(100vh-7rem)] p-6 shadow-sm z-10 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-md text-white">
              <LayoutDashboard size={24} />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-stone-900 to-stone-600 dark:from-stone-100 dark:to-stone-400 bg-clip-text text-transparent">
              Admin
            </h2>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    isActive
                      ? "bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400 shadow-sm"
                      : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-100"
                  }`}
                >
                  <span className={`${isActive ? "scale-110" : "scale-100"} transition-transform duration-300`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 w-full overflow-x-hidden relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-accent-500/5 to-transparent dark:from-accent-500/10 pointer-events-none -z-10" />
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
