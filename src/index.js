import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "src/assets/vendor/nucleo/css/nucleo.css";
import "src/assets/vendor/font-awesome/css/font-awesome.min.css";
import "src/assets/scss/argon-design-system-react.scss?v1.1.0";

import Index from "src/components/Index/Index";
import Login from "src/components/LogIn-SignUp/Login";
import Register from "src/components/LogIn-SignUp/Register";
import AdminIndex from "src/components/Index/AdminIndex";
import { GoogleOAuthProvider } from '@react-oauth/google';
import PrivateRoute from "src/components/Private Routes/PrivateRoute";
import PrivateAdminRoute from "src/components/Private Routes/PrivateAdminRoute";
import Remote from "src/components/Index/Remote";

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_TEST_KEY);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
        {/* Wrap the Elements provider around components that need Stripe */}
        <Elements stripe={stripePromise}>
          <Routes>
            {/* Public routes */}
            <Route path="/login-page" exact element={<Login />} />
            <Route path="/register-page" exact element={<Register />} />
            <Route path="/remote" excat element={<Remote />} /> 

            {/* Private routes */}
            <Route path="/" exact element={<PrivateRoute element={Index} />} />

            {/* Private route for admin */}
            <Route path="/admin" element={<PrivateAdminRoute element={AdminIndex} />} />

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Elements>
      </BrowserRouter>

      </I18nextProvider>
  </GoogleOAuthProvider>
);
