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

const SignupNavbar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Dropdown states
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  // Toggle dropdown
  const toggleLanguageDropdown = () =>
    setLanguageDropdownOpen(!languageDropdownOpen);

  // Collapse state
  const [isOpen, setIsOpen] = useState(false);
  const toggleNavbar = () => setIsOpen(!isOpen);

  // Change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const handleSignIn = () => {
    navigate("/login-page");
  };

  useEffect(() => {
    const headroom = new Headroom(document.getElementById("navbar-main"));
    headroom.init();
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
            <i
              className="fa fa-bars"
              style={{ color: "#c7bebd", fontSize: "1.5rem" }}
            ></i>
          </NavbarToggler>

          {/* Collapsible content */}
          <Collapse isOpen={isOpen} navbar>
            {/* RIGHT side nav */}
            <Nav className="ml-auto" navbar>
              {/* Language Dropdown */}
              <NavItem>
                <Dropdown
                  nav
                  inNavbar
                  isOpen={languageDropdownOpen}
                  toggle={toggleLanguageDropdown}
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  <DropdownToggle
                    nav
                    caret
                    className="h3 font-weight-bold"
                  >
                    <i className="fa fa-language mr-2" />
                    {t("language")}
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem onClick={() => changeLanguage("it")}>Italiano</DropdownItem>
                    <DropdownItem onClick={() => changeLanguage("en")}>English</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavItem>

              {/* Sign In Button */}
              <NavItem>
                <NavLink
                  tag={Link}
                  to="/login-page"
                  className="h3 font-weight-bold"
                  style={{
                    // fontSize: "1rem",
                    textTransform: "uppercase",
                  }}
                >
                  <i className="fa fa-sign-in mr-2" />
                  {t("signIn")}
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default SignupNavbar;
