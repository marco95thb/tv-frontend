import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Headroom from "headroom.js";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarBrand,
  Navbar,
  NavItem,
  Nav,
  Container,
  Collapse,
  NavbarToggler,
  NavLink,
} from "reactstrap";
import { useTranslation } from "react-i18next";
// If you are actually using jwt-decode as an npm package,
// you should import it like this:
// import jwtDecode from "jwt-decode";
import { jwtDecode } from "jwt-decode";

const DemoNavbar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // State for isAdmin flag
  const [isAdmin, setIsAdmin] = useState(false);

  // Dropdown states
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [logoutDropdownOpen, setLogoutDropdownOpen] = useState(false);

  // Toggle dropdowns
  const toggleLanguageDropdown = () =>
    setLanguageDropdownOpen(!languageDropdownOpen);
  const toggleLogoutDropdown = () =>
    setLogoutDropdownOpen(!logoutDropdownOpen);

  // Collapse state
  const [isOpen, setIsOpen] = useState(false);
  const toggleNavbar = () => setIsOpen(!isOpen);

  // User info state
  const [userName, setUserName] = useState("");

  // Change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login-page");
  };

  useEffect(() => {
    const headroom = new Headroom(document.getElementById("navbar-main"));
    headroom.init();

    // Set default language to Italian
    i18n.changeLanguage("it");

    // Extract user info from JWT token
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);
      setUserName(decodedToken.fullName || "User"); // Set username
      
      // Check if the user is an admin
      setIsAdmin(decodedToken.isAdmin || false); // Set isAdmin flag
    }
  }, [i18n]);

  return (
    <header className="header-global">
      <Navbar
        className="navbar-main navbar-transparent headroom navbar-light"
        expand="lg"
        id="navbar-main"
        style={{ color: "black" }} // keeps navbar transparent
      >
        <Container>
          {/* Brand on the far-left */}
          <NavbarBrand to="/" tag={Link}>
            <img
              alt="..."
              src={require("../../assets/img/brand/argon-react-white.png")}
              style={{ width: "50px", height: "auto" }}
            />
          </NavbarBrand>

          {/* Toggler for small screens */}
          <NavbarToggler onClick={toggleNavbar} style={{ zIndex: 2000 }}>
            <i className="fa fa-bars" style={{ color: "#c7bebd", fontSize: "1.5rem" }}></i>
          </NavbarToggler>

            
          {/* Collapsible content */}
          <Collapse isOpen={isOpen} navbar>
            {/* LEFT side nav: Home link */}
            <Nav className="mr-auto" navbar>
              <NavItem>
                <NavLink
                  tag={Link}
                  to="/"
                  className="h3 font-weight-bold"
                  style={{ fontSize: "1rem", fontWeight: "bold", textTransform: "uppercase" }}
                >
                  Home
                </NavLink>
              </NavItem>
            

              {isAdmin && (
                <NavItem>
                  <NavLink
                    tag={Link}
                    to="/admin"
                    className="h3 font-weight-bold"
                    style={{ fontSize: "1rem", fontWeight: "bold", textTransform: "uppercase" }}
                  >
                    Admin
                  </NavLink>
                </NavItem>
              )}
            </Nav>

            {/* RIGHT side nav: Language + Username */}
            <Nav className="ml-auto" navbar>
              {/* Language Dropdown */}
              <NavItem>
                <Dropdown
                  nav
                  inNavbar
                  isOpen={languageDropdownOpen}
                  toggle={toggleLanguageDropdown}
                  style={{ fontSize: "1rem", fontWeight: "bold", textTransform: "uppercase" }}
                >
                  <DropdownToggle nav caret className="h3 font-weight-bold" >
                    <i className="fa fa-language mr-2" />
                    Language
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem onClick={() => changeLanguage("it")}>
                      Italiano
                    </DropdownItem>
                    <DropdownItem onClick={() => changeLanguage("en")}>
                      English
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavItem>

              {/* User Dropdown */}
              <NavItem>
                <Dropdown
                  nav
                  inNavbar
                  isOpen={logoutDropdownOpen}
                  toggle={toggleLogoutDropdown}
                  style={{ fontSize: "1rem", fontWeight: "bold", textTransform: "uppercase" }}

                >
                  <DropdownToggle nav caret className="h5 font-weight-bold">
                    <i className="fa fa-user mr-2" />
                    {userName}
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem onClick={handleLogout}>
                      <i className="fa fa-sign-out mr-2" />
                      {t("logout")}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default DemoNavbar;
