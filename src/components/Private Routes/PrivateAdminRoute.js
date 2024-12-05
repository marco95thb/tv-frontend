import React from "react";
import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode"; // Ensure this is installed: npm install jwt-decode

// Helper function to check if the token is expired
const isTokenExpired = (token) => {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return decodedToken.exp < currentTime; // Token is expired if exp is in the past
  } catch (error) {
    console.error("Error decoding token", error);
    return true; // Treat invalid tokens as expired
  }
};

// Helper function to check if the user is an authenticated admin
const isAuthenticatedAdmin = () => {
  const token = localStorage.getItem("token");

  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token); // Decode the JWT token

    // Check for isAdmin field and token expiration
    const isAdmin = decodedToken.isAdmin;
    if (isTokenExpired(token)) {
      console.log("Token is expired");
      return false;
    }

    return isAdmin === true; // Return true only if isAdmin is true and token is valid
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
