import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "assets/vendor/nucleo/css/nucleo.css";
import "assets/vendor/font-awesome/css/font-awesome.min.css";
import "assets/scss/argon-design-system-react.scss?v1.1.0";

import Index from "components/Index/Index";
import Login from "components/LogIn-SignUp/Login";
import Register from "components/LogIn-SignUp/Register";
import AdminIndex from "components/Index/AdminIndex";

import PrivateRoute from "components/Private Routes/PrivateRoute";
import PrivateAdminRoute from "components/Private Routes/PrivateAdminRoute";

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
