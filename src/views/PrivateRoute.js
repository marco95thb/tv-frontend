import React from "react";
import { Navigate } from "react-router-dom";

// Helper function to check if the user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if(token){console.log("User is authenticated")}
  return !!token; // Return true if token exists, false otherwise
};

// PrivateRoute component to protect routes
const PrivateRoute = ({ element: Component }) => {
  return isAuthenticated() ? <Component /> : <Navigate to="/login-page" replace />;
};

export default PrivateRoute;
