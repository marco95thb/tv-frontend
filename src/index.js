import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "./assets/vendor/nucleo/css/nucleo.css";
import "./assets/vendor/font-awesome/css/font-awesome.min.css";
import "./assets/scss/argon-design-system-react.scss?v1.1.0";

import Index from "./components/Index/Index";
import Login from "./components/LogIn-SignUp/Login";
import Register from "./components/LogIn-SignUp/Register";
import AdminIndex from "./components/Index/AdminIndex";
import Prices from "./components/Index/Prices";
import { GoogleOAuthProvider } from '@react-oauth/google';
import PrivateRoute from "./components/Private Routes/PrivateRoute";
import PrivateAdminRoute from "./components/Private Routes/PrivateAdminRoute";
import Remote from "./components/Index/Remote";
import PrivacyPolicy from "./components/LogIn-SignUp/PrivayPolicy";

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
            <Route path="/remote" exact element={<Remote />} /> 
            <Route path="/privacy-policy" exact element={<PrivacyPolicy />} /> 
            <Route path="/prices" exact element={<Prices />} /> 

            {/* Private routes */}
            <Route path="/home" exact element={<Index />} />

            {/* Private route for admin */}
            <Route path="/admin" element={<PrivateAdminRoute element={AdminIndex} />} />

            {/* Redirect unknown routes to login-page */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Elements>
      </BrowserRouter>

      </I18nextProvider>
  </GoogleOAuthProvider>
);