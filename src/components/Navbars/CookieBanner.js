import React, { useEffect, useState } from "react";

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted cookies
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowBanner(false);
  };

  return (
    showBanner && (
      <div style={bannerStyle}>
        <p style={{ margin: 0 }}>
          This website uses cookies to ensure you get the best experience. By
          continuing to use this site, you consent to our use of cookies.{" "}
          <a href="/privacy-policy" style={linkStyle}>Learn more</a>
        </p>
        <button style={buttonStyle} onClick={handleAccept}>
          Accept
        </button>
      </div>
    )
  );
};

// Inline styles
const bannerStyle = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "#333",
  color: "white",
  padding: "15px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  zIndex: 1000,
  fontSize: "14px",
};

const buttonStyle = {
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  padding: "10px 20px",
  cursor: "pointer",
  borderRadius: "5px",
};

const linkStyle = {
  color: "#4CAF50",
  textDecoration: "underline",
};

export default CookieBanner;
