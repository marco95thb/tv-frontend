import React from "react";
// reactstrap components
import { NavItem, NavLink, Nav, Container, Row, Col } from "reactstrap";

import { useTranslation } from "react-i18next";

const SimpleFooter = () => {
  const { t } = useTranslation(); // Initialize translation hook

  return (
    <footer className="footer">
      <Container>
        <Row className="row-grid align-items-center mb-5">
          <Col lg="12">
            <h3 className="text-primary font-weight-light mb-2">
              {t("thankYouMessage")} {/* Replace with a translation key if needed */}
            </h3>
            <h4 className="mb-0 font-weight-light">
              {t("comfortableStayMessage")} {/* Replace with a translation key if needed */}
            </h4>
          </Col>
        </Row>
        <hr />
        <Row className="align-items-center justify-content-md-between">
          <Col md="6">
            <div className="copyright">
              © {new Date().getFullYear()}{" "}
              <a href="https://github.com/Moeez-Muslim" target="_blank" rel="noopener noreferrer">
                attivatv
              </a>
            </div>
          </Col>
          <Col md="6">
            <Nav className="nav-footer justify-content-end">
            <NavItem>
                <NavLink href="https://www.attivatv.it/privacy-policy" rel="noopener noreferrer">
                  Privacy Policy
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="https://github.com/Moeez-Muslim" target="_blank" rel="noopener noreferrer">
                  Developer
                </NavLink>
              </NavItem>
            </Nav>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default SimpleFooter;
