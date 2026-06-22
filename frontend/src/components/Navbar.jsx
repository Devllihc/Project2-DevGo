import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AppContext } from "../context/AppContext.jsx";
import { assets } from "../assets/assets.js";
import ThemeToggle from "./ThemeToggle.jsx";

const Navbar = () => {
  const { user, logout } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const isActive = (path) =>
    location.pathname === path ? "text-accent-600 dark:text-accent-400 font-semibold" : "text-stone-600 dark:text-stone-300 hover:text-accent-500 dark:hover:text-accent-400";

  return (
    <div
      className="w-full flex justify-between items-center py-4 px-6 sm:px-12 lg:px-20 top-0 sticky z-50 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-lg border-b border-stone-200/50 dark:border-stone-800/50 transition-colors duration-300"
    >
      <Link to="/">
        <img
          src="/logoTravel.png"
          className="w-[120px] sm:w-[150px] md:w-[180px] drop-shadow-sm"
          alt="DevGo Logo"
        />
      </Link>

      {/* Mobile buttons */}
      <div className="flex items-center gap-4 sm:hidden">
        <ThemeToggle />
        {user && (
          <div className="relative group">
            <img
              src={assets.user}
              alt="profile"
              className="w-10 drop-shadow rounded-full"
            />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 p-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              Hi, {user.name}
            </div>
          </div>
        )}
        <button onClick={toggleMenu} className="text-2xl text-stone-800 dark:text-stone-200">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8">
        <ul className="flex gap-8 items-center font-medium">
          <li>
            <Link to="/" className={`transition-colors ${isActive("/")}`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className={`transition-colors ${isActive("/about")}`}>
              About
            </Link>
          </li>
          <li>
            <Link to="/tours" className={`transition-colors ${isActive("/tours")}`}>
              Tours
            </Link>
          </li>
          <li>
            <Link to="/my-trips" className={`transition-colors ${isActive("/my-trips")}`}>
              Trips
            </Link>
          </li>
          {user?.role === "admin" && (
            <li>
              <Link to="/admin" className={`transition-colors ${isActive("/admin")}`}>
                Dashboard
              </Link>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-5 pl-6 border-l border-stone-300 dark:border-stone-700">
          <ThemeToggle />
          {user ? (
            <>
              <div className="relative group flex items-center gap-3">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300 hidden lg:block">Hi, {user.name}</span>
                <img
                  src={assets.user}
                  alt="profile"
                  width={40}
                  className="cursor-pointer shadow-sm rounded-full"
                />
              </div>
              <button
                onClick={logout}
                className="px-5 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-medium rounded-full hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">
              <button className="px-6 py-2.5 bg-accent-500 text-white text-sm font-medium rounded-full hover:bg-accent-600 transition-colors shadow-md shadow-accent-500/20">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden absolute top-[72px] left-0 w-full bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-md p-6 shadow-xl border-t border-stone-200 dark:border-stone-800 transition-colors duration-300">
          <ul className="flex flex-col items-center gap-6 font-medium">
            <li>
              <Link to="/" className={isActive("/")} onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className={isActive("/about")} onClick={() => setMenuOpen(false)}>
                About
              </Link>
            </li>
            <li>
              <Link to="/tours" className={isActive("/tours")} onClick={() => setMenuOpen(false)}>
                Tours
              </Link>
            </li>
            <li>
              <Link to="/my-trips" className={isActive("/my-trips")} onClick={() => setMenuOpen(false)}>
                Trips
              </Link>
            </li>
            {user?.role === "admin" && (
              <li>
                <Link to="/admin" className={isActive("/admin")} onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
              </li>
            )}
            {user ? (
              <li className="w-full pt-4 border-t border-stone-200 dark:border-stone-700">
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
                >
                  Logout
                </button>
              </li>
            ) : (
              <li className="w-full pt-4 border-t border-stone-200 dark:border-stone-700">
                <Link to="/login">
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="w-full px-6 py-3 bg-accent-500 text-white rounded-xl hover:bg-accent-600 shadow-md shadow-accent-500/20 transition-colors"
                  >
                    Login
                  </button>
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
