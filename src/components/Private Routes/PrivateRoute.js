import React from "react";
import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

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

// Helper function to check if the user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (token) {
    if (isTokenExpired(token)) {
      console.log("Token is expired");
      return false;
    }
    console.log("User is authenticated");
    return true;
  }
  return false;
};

// PrivateRoute component to protect routes
const PrivateRoute = ({ element: Component }) => {
  return isAuthenticated() ? <Component /> : <Navigate to="/login-page" replace />;
};

export default PrivateRoute;
