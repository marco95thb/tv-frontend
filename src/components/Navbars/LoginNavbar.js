import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Headroom from "headroom.js";
import {
  Button,
  NavbarBrand,
  Navbar,
  NavItem,
  Nav,
  Container,
  Row,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { useTranslation } from "react-i18next";

const LoginNavbar = () => {
  const { t, i18n } = useTranslation(); // Initialize useTranslation

  const [collapseClasses, setCollapseClasses] = useState("");
  const [collapseOpen, setCollapseOpen] = useState(false);
  const navigate = useNavigate(); // useNavigate hook for navigation

  const [dropdownOpen, setDropdownOpen] = React.useState(false);


  // Function to toggle the language dropdown
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Function to change the language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Update the current language
  };

  useEffect(() => {
    const headroom = new Headroom(document.getElementById("navbar-main"));
    headroom.init();
  }, []);

  const onExiting = () => {
    setCollapseClasses("collapsing-out");
  };

  const onExited = () => {
    setCollapseClasses("");
  };

  const handleSignUp = () => {
    // Navigate to the register page using useNavigate hook
    navigate("/register-page");
  };

  return (
    <>
      <header className="header-global">
        <Navbar
          className="navbar-main navbar-transparent navbar-light headroom"
          id="navbar-main"
        >
          <Container>
            <NavbarBrand className="mr-lg-5">
              <img
                alt="..."
                src={require("src/assets/img/brand/argon-react-white.png")}
                style={{ width: '70px', height: 'auto' }} // Adjust the size here
              />
            </NavbarBrand>

            <Nav className="align-items-lg-center ml-lg-auto" navbar>
              <NavItem className="ml-lg-4">
                <Button
                  className="btn-neutral btn-icon"
                  color="default"
                  onClick={handleSignUp} // Navigate to register page on click
                >
                  <span className="btn-inner--icon">
                    <i className="fa fa-user-plus mr-2" />
                  </span>
                  <span className="nav-link-inner--text ml-1">{t("signUp")}</span>
                </Button>

                <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                  <DropdownToggle caret color="github">
                  <span className="btn-inner--icon">
                    <i className="fa fa-language mr-2" />
                  </span>{t('language')} {/* Display "Language" */}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => changeLanguage('it')}>
                      Italiano
                    </DropdownItem>
                    <DropdownItem onClick={() => changeLanguage('en')}>
                      English
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                
              </NavItem>
            </Nav>
          </Container>
        </Navbar>
      </header>
    </>
  );
};

export default LoginNavbar;
