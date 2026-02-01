import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Route, Routes } from "react-router-dom";
import Tour from "./pages/Tour";
import TourDetails from "./pages/TourDetails";
import Login from "./pages/Login";
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
const App = () => {
  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-8 md:px-10 lg:px-22 bg-gradient-to-b from-sky-100 to-indigo-100">
      <ToastContainer theme="dark" position="bottom-right" autoClose={1000} />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Tour />} />
          <Route path="/about" element={<About />} />
          <Route path="/tours/:id" element={<TourDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />}>
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

          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/generate" element={<Planning />} />
          <Route path="/trip/:id" element={<TripDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
