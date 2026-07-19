import React from "react";
import Navbar from "./components/ui/Navbar";
import Footer from "./components/ui/Footer";
import { Route, Routes, useLocation } from "react-router-dom";
import Tour from "./pages/tours/Tour";
import TourDetails from "./pages/tours/TourDetails";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Booking from "./pages/bookings/Booking";
import Invoice from "./pages/bookings/Invoice";
import About from "./pages/About";
import AdminRoute from "./guards/PrivateRoute";
import UserRoute from "./guards/UserRoute";
import AdminUserList from "./pages/admin/AdminUserList";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminBookingList from "./pages/admin/AdminBookingList";
import AdminTourManagement from "./pages/admin/AdminTourManagement";
import AdminReviewManagement from "./pages/admin/AdminReviewManagement";
import Planning from "./pages/trips/Planning";
import MyTrips from "./pages/trips/MyTrips";
import TripDetail from "./pages/trips/TripDetail";
import BookingHistory from "./pages/bookings/BookingHistory";
import Profile from "./pages/user/Profile";
import ScrollToTop from "./components/ui/ScrollToTop";
import NotFound from "./pages/NotFound";

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isFullscreenPage = ["/", "/about", "/tours", "/my-trips"].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      <ScrollToTop />
      <ToastContainer theme="dark" position="bottom-right" autoClose={1000} />
      {!isAdminRoute && <Navbar />}
      <main className={isAdminRoute ? "flex-1" : `flex-1 ${isFullscreenPage ? "" : "pt-28"}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Tour />} />
          <Route path="/about" element={<About />} />
          <Route path="/tours/:id" element={<TourDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUserList />} />
            <Route path="bookings" element={<AdminBookingList />} />
            <Route path="tours" element={<AdminTourManagement />} />
            <Route path="reviews" element={<AdminReviewManagement />} />
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
          <Route
            path="/profile"
            element={
              <UserRoute>
                <Profile />
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
      {!isAdminRoute && !isFullscreenPage && <Footer />}
    </div>
  );
};

export default App;
