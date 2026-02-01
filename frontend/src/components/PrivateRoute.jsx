// components/AdminRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const AdminRoute = ({ children }) => {
  const { user } = useContext(AppContext);

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== "admin") return <Navigate to="/" />;

  return children;
};

export default AdminRoute;
