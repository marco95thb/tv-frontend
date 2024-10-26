import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "assets/vendor/nucleo/css/nucleo.css";
import "assets/vendor/font-awesome/css/font-awesome.min.css";
import "assets/scss/argon-design-system-react.scss?v1.1.0";

import Index from "views/Index.js";
import Login from "views/examples/Login.js";
import Register from "views/examples/Register.js";
import AdminIndex from "views/AdminIndex"; // Admin landing page

import PrivateRoute from "views/PrivateRoute"; // Import the private route component
import PrivateAdminRoute from "views/PrivateAdminRoute"; // Import the private admin route component

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/login-page" exact element={<Login />} />
      <Route path="/register-page" exact element={<Register />} />

      {/* Private routes */}
      <Route path="/" exact element={<PrivateRoute element={Index} />} />
      
      {/* Private route for admin */}
      <Route path="/admin" element={<PrivateAdminRoute element={AdminIndex} />} />

      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
