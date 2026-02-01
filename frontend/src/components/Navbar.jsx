import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AppContext } from "../context/AppContext.jsx";
import { assets } from "../assets/assets.js";

const Navbar = () => {
  const { user, logout } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Helper function để check active link cho gọn code
  const isActive = (path) =>
    location.pathname === path ? "text-blue-500 font-bold" : "";

  return (
    <div
      className="w-full flex justify-between items-center py-2 px-2 sm:py-0 sm:px-20 top-0 sticky z-50"
      style={{
        backgroundColor: "rgba(224, 242, 254, 1)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Link to="/">
        <img
          src="/logoTravel.png"
          className="w-[140px] sm:w-[180px] md:w-[200px]"
          alt="logo"
        />
      </Link>

      {/* Mobile buttons */}
      <div className="flex items-center gap-4 sm:hidden">
        {user && (
          <div className="relative group">
            <img
              src={assets.user}
              alt="profileimg"
              className="w-10 drop-shadow"
            />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 p-2 bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              Hi, {user.name}
            </div>
          </div>
        )}
        <button onClick={toggleMenu} className="text-2xl">
          {menuOpen ? (
            <X className="text-black" />
          ) : (
            <Menu className="text-black" />
          )}
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-6">
        <ul className="flex gap-6 items-center">
          <li>
            <Link to="/" className={`hover:text-blue-500 ${isActive("/")}`}>
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={`hover:text-blue-500 ${isActive("/about")}`}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/tours"
              className={`hover:text-blue-500 ${isActive("/tours")}`}
            >
              Tours
            </Link>
          </li>

          <li>
            <Link
              to="/my-trips"
              className={`hover:text-blue-500 ${isActive("/my-trips")}`}
            >
              Trips
            </Link>
          </li>

          {user?.role === "admin" && (
            <li>
              <Link
                to="/admin"
                className={`hover:text-blue-500 ${isActive("/admin")}`}
              >
                Dashboard
              </Link>
            </li>
          )}
        </ul>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={assets.user}
                alt="profile"
                width={40}
                className="cursor-pointer"
              />
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 p-2 bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Hi, {user.name}
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gradient-to-b from-sky-500 to-blue-500 text-white rounded hover:from-sky-800 hover:to-blue-700 transition-all"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login">
            <button className="px-4 py-2 bg-gradient-to-b from-sky-500 to-blue-500 text-white rounded hover:from-sky-800 hover:to-blue-700 transition-all">
              Login
            </button>
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden absolute top-16 left-0 w-full bg-sky-100/95 p-4 shadow-lg border-t border-sky-200">
          <ul className="flex flex-col items-center gap-4">
            <li>
              <Link
                to="/"
                className={`hover:text-blue-500 ${isActive("/")}`}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`hover:text-blue-500 ${isActive("/about")}`}
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/tours"
                className={`hover:text-blue-500 ${isActive("/tours")}`}
                onClick={() => setMenuOpen(false)}
              >
                Tours
              </Link>
            </li>

            <li>
              <Link
                to="/my-trips"
                className={`hover:text-blue-500 ${isActive("/my-trips")}`}
                onClick={() => setMenuOpen(false)}
              >
                Trips
              </Link>
            </li>

            {user?.role === "admin" && (
              <li>
                <Link
                  to="/admin"
                  className={`hover:text-blue-500 ${isActive("/admin")}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
            )}

            {user ? (
              <li>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-b from-sky-500 to-blue-500 text-white rounded hover:from-sky-800 hover:to-blue-700 w-full"
                >
                  Logout
                </button>
              </li>
            ) : (
              <li>
                <Link to="/login">
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-2 bg-gradient-to-b from-sky-500 to-blue-500 text-white rounded hover:from-sky-800 hover:to-blue-700 w-full"
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
