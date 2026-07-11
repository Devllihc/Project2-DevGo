import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Tour from "./pages/Tour";
import TourDetails from "./pages/TourDetails";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Booking from "./pages/Booking";
import Invoice from "./pages/Invoice";
import About from "./pages/About";
import AdminRoute from "./components/PrivateRoute";
import UserRoute from "./components/UserRoute";
import AdminUserList from "./pages/admin/AdminUserList";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookingList from "./pages/admin/AdminBookingList";
import AdminTourManagement from "./pages/admin/AdminTourManagement";
import Planning from "./components/Planning";
import MyTrips from "./components/MyTrips";
import TripDetail from "./components/TripDetail";
import BookingHistory from "./pages/BookingHistory";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";

const App = () => {
  const location = useLocation();
  const isFullscreenPage = ["/", "/about", "/tours", "/my-trips"].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      <ScrollToTop />
      <ToastContainer theme="dark" position="bottom-right" autoClose={1000} />
      <Navbar />
      <main className={`flex-1 ${isFullscreenPage ? "" : "pt-28"}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Tour />} />
          <Route path="/about" element={<About />} />
          <Route path="/tours/:id" element={<TourDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<Navigate to="users" replace />} />
            <Route
              path="users"
              element={
                <AdminRoute>
                  <AdminUserList />
                </AdminRoute>
              }
            />
            <Route
              path="bookings"
              element={
                <AdminRoute>
                  <AdminBookingList />
                </AdminRoute>
              }
            />
            <Route
              path="tours"
              element={
                <AdminRoute>
                  <AdminTourManagement />
                </AdminRoute>
              }
            />
          </Route>

          <Route
            path="/booking"
            element={
              <UserRoute>
                <Booking />
              </UserRoute>
            }
          />
          <Route
            path="/invoice"
            element={
              <UserRoute>
                <Invoice />
              </UserRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <UserRoute>
                <BookingHistory />
              </UserRoute>
            }
          />

          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/generate" element={<Planning />} />
          <Route path="/trip/:id" element={<TripDetail />} />
          
          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isFullscreenPage && <Footer />}
    </div>
  );
};

export default App;
