import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Headroom from "headroom.js";
import {
  NavbarBrand,
  Navbar,
  NavItem,
  Nav,
  Container,
} from "reactstrap";

const RemoteNavbar = () => {
  const [collapseClasses, setCollapseClasses] = useState("");
  const [collapseOpen, setCollapseOpen] = useState(false);

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
                <span className="nav-link-inner--text ml-1" style={{ color: 'white', fontWeight: 'bold', fontSize: '2em' }}>
                  Remote
                </span>
              </NavItem>
            </Nav>
          </Container>
        </Navbar>
      </header>
    </>
  );
};

export default RemoteNavbar;
