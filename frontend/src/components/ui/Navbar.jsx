import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { List, X } from "@phosphor-icons/react";
import { AppContext } from "../../context/AppContext.jsx";
import { assets } from "../../assets/assets.js";
import ThemeToggle from "./ThemeToggle.jsx";
import NotificationDropdown from "./NotificationDropdown.jsx";

const Navbar = () => {
  const { user, logout } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const isActive = (path) =>
    location.pathname === path 
      ? "text-accent-600 dark:text-accent-400 font-semibold" 
      : "text-stone-500 dark:text-stone-400 hover:text-accent-500 dark:hover:text-accent-400 transition-colors duration-300";

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center w-full px-4 sm:px-6 pt-6 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between px-4 sm:px-6 py-3 bg-white/70 dark:bg-stone-950/70 backdrop-blur-2xl border border-stone-200/50 dark:border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] w-full max-w-[1200px]">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group ml-2">
          <img src="/logoTravel.png" className="w-[100px] sm:w-[120px] drop-shadow-sm group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" alt="DevGo Logo" />
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8 text-sm tracking-wide">
          <li><Link to="/" className={isActive("/")}>Home</Link></li>
          <li><Link to="/about" className={isActive("/about")}>About</Link></li>
          <li><Link to="/tours" className={isActive("/tours")}>Tours</Link></li>
          <li><Link to="/my-trips" className={isActive("/my-trips")}>Trips</Link></li>
          {user && user.role !== "admin" && (
            <>
              <li><Link to="/my-bookings" className={isActive("/my-bookings")}>Bookings</Link></li>
              <li><Link to="/wishlist" className={isActive("/wishlist")}>Wishlist</Link></li>
            </>
          )}
          {user?.role === "admin" && (
            <li><Link to="/admin" className={isActive("/admin")}>Dashboard</Link></li>
          )}
        </ul>

        {/* Controls */}
        <div className="flex items-center gap-3 sm:gap-4 mr-1 sm:mr-2">
          <div className="hidden sm:flex items-center gap-2">
            <NotificationDropdown />
            <ThemeToggle />
          </div>
          
          {user ? (
            <div className="hidden md:flex items-center gap-4 border-l border-stone-200 dark:border-white/10 pl-4">
              <Link to="/profile" className="flex items-center gap-2 group cursor-pointer">
                <img 
                  src={user.photo ? (user.photo.startsWith("http") ? user.photo : `${import.meta.env.VITE_BACKEND_URL}${user.photo}`) : assets.user} 
                  alt="profile" 
                  className="w-9 h-9 object-cover rounded-full border-2 border-transparent group-hover:border-accent-500 transition-colors" 
                />
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300 hidden lg:block group-hover:text-accent-500 transition-colors">{user.name}</span>
              </Link>
              <button 
                onClick={logout}
                className="group relative flex items-center justify-center px-5 py-2 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-white text-sm font-medium active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex border-l border-stone-200 dark:border-white/10 pl-4">
              <Link to="/login">
                <button className="group relative flex items-center justify-center px-6 py-2.5 rounded-full bg-accent-500 text-white text-sm font-medium active:scale-[0.98] hover:bg-accent-600 hover:shadow-lg hover:shadow-accent-500/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  Login
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Toggle */}
          <button onClick={toggleMenu} className="md:hidden text-stone-800 dark:text-stone-200 p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            {menuOpen ? <X size={24} weight="light" /> : <List size={24} weight="light" />}
          </button>
        </div>
      </nav>

      {/* Fullscreen Mobile Menu morph */}
      <div 
        className={`fixed inset-0 z-[-1] bg-white/95 dark:bg-stone-950/95 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col pt-32 px-8 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-y-8'}`}
      >
        <ul className="flex flex-col gap-6 text-3xl font-light tracking-tight text-stone-900 dark:text-white">
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
          <li><Link to="/tours" onClick={() => setMenuOpen(false)}>Tours</Link></li>
          {user && (
            <li><Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link></li>
          )}
          {user && user.role !== "admin" && (
            <li><Link to="/my-trips" onClick={() => setMenuOpen(false)}>Trips</Link></li>
          )}
          {user && user.role !== "admin" && (
            <>
              <li><Link to="/my-bookings" onClick={() => setMenuOpen(false)}>Bookings</Link></li>
              <li><Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link></li>
            </>
          )}
          {user?.role === "admin" && (
            <li><Link to="/admin" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
          )}
        </ul>

        <div className="mt-auto pb-12 flex flex-col gap-6">
          <ThemeToggle />
          {user ? (
            <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full py-4 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-white font-medium text-lg">Logout</button>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full py-4 rounded-full bg-accent-500 text-white font-medium text-lg text-center shadow-lg shadow-accent-500/20">Login</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
