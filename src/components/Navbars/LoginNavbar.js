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
} from "reactstrap";

const LoginNavbar = () => {
  const [collapseClasses, setCollapseClasses] = useState("");
  const [collapseOpen, setCollapseOpen] = useState(false);
  const navigate = useNavigate(); // useNavigate hook for navigation

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
                src={require("assets/img/brand/argon-react-white.png")}
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
                  <span className="nav-link-inner--text ml-1">Sign Up</span>
                </Button>
              </NavItem>
            </Nav>
          </Container>
        </Navbar>
      </header>
    </>
  );
};

export default LoginNavbar;
