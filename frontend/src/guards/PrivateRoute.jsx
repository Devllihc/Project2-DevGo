// components/AdminRoute.jsx
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const AdminRoute = ({ children }) => {
  const { user } = useContext(AppContext);
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== "admin") return <Navigate to="/" />;

  return children;
};

export default AdminRoute;
