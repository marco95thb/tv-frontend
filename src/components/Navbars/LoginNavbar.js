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

const LoginNavbar = () => {
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

  const handleSignUp = () => {
    navigate("/register-page");
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

              {/* Sign Up Button */}
              <NavItem>
                <NavLink
                  tag={Link}
                  to="/register-page"
                  className="h3 font-weight-bold"
                  style={{
                    // fontSize: "1rem",
                    textTransform: "uppercase",
                  }}
                >
                  <i className="fa fa-user-plus mr-2" />
                  {t("signUp")}
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default LoginNavbar;