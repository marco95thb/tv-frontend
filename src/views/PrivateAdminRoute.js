import React from "react";
import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

// Helper function to check if the user is an admin
const isAuthenticatedAdmin = () => {
  const token = localStorage.getItem("token");

  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token); // Decode the JWT token
    const isAdmin = decodedToken.isAdmin; // Check for isAdmin field in the decoded token
    return isAdmin === true; // Return true only if isAdmin is true
  } catch (error) {
    console.error("Invalid token");
    return false; // Return false if token is invalid or there's any issue
  }
};

// Private route component for admin access
const PrivateAdminRoute = ({ element: Component }) => {
  return isAuthenticatedAdmin() ? <Component /> : <Navigate to="/login-page" replace />;
};

export default PrivateAdminRoute;
