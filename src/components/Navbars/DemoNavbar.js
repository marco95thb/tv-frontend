import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import Headroom from "headroom.js";
import {
  Button,
  NavbarBrand,
  Navbar,
  NavItem,
  Nav,
  Container,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { useTranslation } from "react-i18next"; // Import useTranslation

const DemoNavbar = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { t, i18n } = useTranslation(); // Initialize useTranslation
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Function to toggle the language dropdown
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Function to change the language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Update the current language
  };

  // Function to handle logout
  const handleLogout = () => {
    // Clear JWT token from localStorage
    localStorage.removeItem("token");

    // Navigate to the login page
    navigate('/login-page');
  };

  useEffect(() => {
    const headroom = new Headroom(document.getElementById("navbar-main"));
    headroom.init();

    // Set default language to Italian
    i18n.changeLanguage('it');
  }, [i18n]);

  return (
    <>
      <header className="header-global">
        <Navbar
          className="navbar-main navbar-transparent navbar-light headroom"
          id="navbar-main"
        >
          <Container>
            <NavbarBrand className="mr-lg-5" to="/" tag={Link}>
              <img
                alt="..."
                src={require("assets/img/brand/argon-react-white.png")}
                style={{ width: '70px', height: 'auto' }}
              />
            </NavbarBrand>


            <Nav className="align-items-lg-center ml-lg-auto" navbar>
              {/* Logout Button */}
              <NavItem className="ml-lg-4">
                <Button
                  className="btn-neutral btn-icon"
                  color="default"
                  onClick={handleLogout} // Trigger logout
                >
                  <span className="btn-inner--icon">
                    <i className="fa fa-sign-out mr-2" />
                  </span>
                  <span className="nav-link-inner--text ml-1">{t('logout')}</span> 
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

export default DemoNavbar;
