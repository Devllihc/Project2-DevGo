import { useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Users, CalendarDays, Map, LayoutDashboard, LogOut, MessageSquare, Settings } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import ThemeToggle from "../../components/ui/ThemeToggle";
import NotificationDropdown from "../../components/ui/NotificationDropdown";

const NAV_ITEMS = [
  { path: "", label: "Overview", icon: LayoutDashboard, exact: true },
  { path: "users", label: "Users", icon: Users },
  { path: "bookings", label: "Bookings", icon: CalendarDays },
  { path: "tours", label: "Tours", icon: Map },
  { path: "reviews", label: "Reviews", icon: MessageSquare },
  { path: "settings", label: "Settings", icon: Settings },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AppContext);

  const isItemActive = (item) => {
    const base = `/admin${item.path ? `/${item.path}` : ""}`;
    return item.exact ? location.pathname === base : location.pathname.startsWith(base);
  };

  const activeItem = NAV_ITEMS.find(isItemActive);
  const pageTitle = activeItem?.label || "Admin";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Sidebar (desktop only) */}
      <aside className="w-64 shrink-0 hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="h-14 shrink-0 flex items-center gap-2 px-6 border-b border-stone-200 dark:border-stone-800">
          <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center text-white">
            <LayoutDashboard size={18} />
          </div>
          <span className="font-semibold text-stone-900 dark:text-stone-100">DevGo Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.label}
                to={`/admin${item.path ? `/${item.path}` : ""}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  active
                    ? "bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-600 dark:text-accent-400 font-semibold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{user?.name}</div>
              <div className="text-xs text-stone-500 dark:text-stone-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Sticky header: title/actions (all breakpoints) + nav tabs (mobile only), stacked in one
            sticky block so there's no manual offset math for a fixed mobile bar. */}
        <div className="sticky top-0 z-30 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
          <div className="h-14 flex items-center justify-between px-4 md:px-6">
            <h1 className="text-base font-semibold text-stone-900 dark:text-stone-100">{pageTitle}</h1>
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <ThemeToggle />
            </div>
          </div>
          <nav className="md:hidden flex items-center gap-1 px-2 pb-2 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <Link
                  key={item.label}
                  to={`/admin${item.path ? `/${item.path}` : ""}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    active
                      ? "bg-accent-50 dark:bg-accent-950/30 text-accent-600 dark:text-accent-400"
                      : "text-stone-500 dark:text-stone-400"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
