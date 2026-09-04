// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const currentUser = useSelector((state) => state.users.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // redirect to last visited or dashboard
    return <Navigate to={location.state?.from || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
