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
    // Set language preference
    localStorage.setItem('language', lng); // Store language in local storage
    setIsOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login-page");
  };

  useEffect(() => {
    // const headroom = new Headroom(document.getElementById("navbar-main"));
    // headroom.init();

    // Extract user info from JWT token
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserName(decodedToken.fullName || "User"); // Set username
      
      // Check if the user is an admin
      setIsAdmin(decodedToken.isAdmin || false); // Set isAdmin flag
    }
  }, [i18n]);

  return (
    <header className="header-global">
      <Navbar
        className="navbar-main navbar-light"
        expand="lg"
        id="navbar-main"
        style={{ backgroundColor: "grey", color: "black" }}
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
              <Nav className="ml-auto mt-2" navbar>
              {isAdmin && (<NavItem>
                <NavLink
                  tag={Link}
                  to="/home"
                  className="h3 font-weight-bold"
                  style={{ fontWeight: "bold", textTransform: "uppercase" }}
                >
                   <i className="fa fa-home mr-2" />
                   {t("home")}
                </NavLink>
              </NavItem>
              )}
            

              {isAdmin && (
                <NavItem>
                  <NavLink
                    tag={Link}
                    to="/admin"
                    className="h3 font-weight-bold"
                    style={{ fontWeight: "bold", textTransform: "uppercase" }}
                  >
                     <i className="fa fa-gear mr-2" />
                     {t("admin")}
                  </NavLink>
                </NavItem>
              )}
              <NavItem>
                <NavLink
                  tag={Link}
                  to="/prices"
                  className="h3 font-weight-bold"
                  style={{ fontWeight: "bold", textTransform: "uppercase" }}
                >
                    <i className="fa fa-euro mr-2" />
                    {t("pricing")}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  tag={Link}
                  to="/instructions"
                  className="h3 font-weight-bold"
                  style={{ fontWeight: "bold", textTransform: "uppercase" }}
                >
                    <i className="fa fa-info-circle mr-2" />
                    {t("instructions")}
                </NavLink>
              </NavItem>

            {/* RIGHT side nav: Language + Username */}
            {/* <Nav className="ml-auto" navbar> */}
              {/* Language Dropdown */}
              <NavItem>
                <Dropdown
                  nav
                  inNavbar
                  isOpen={languageDropdownOpen}
                  toggle={toggleLanguageDropdown}
                  style={{ fontWeight: "bold", textTransform: "uppercase" }}
                >
                  <DropdownToggle nav caret className="h3 font-weight-bold" >
                    <i className="fa fa-language mr-2" />
                    Language
                  </DropdownToggle>
                  <DropdownMenu right>
                  <DropdownItem onClick={() => changeLanguage("en")}>
                      English
                    </DropdownItem>
                    <DropdownItem onClick={() => changeLanguage("it")}>
                      Italiana
                    </DropdownItem>
                    <DropdownItem onClick={() => changeLanguage("fr")}>
                      Français
                    </DropdownItem>
                    <DropdownItem onClick={() => changeLanguage("es")}>
                      Español
                    </DropdownItem>
                    <DropdownItem onClick={() => changeLanguage("ar")}>
                    عربي
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
                  style={{fontWeight: "bold", textTransform: "uppercase" }}

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
