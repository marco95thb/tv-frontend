import React from "react";
// reactstrap components
import {
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col,
} from "reactstrap";

class SimpleFooter extends React.Component {
  render() {
    return (
      <>
        <footer className="footer">
          <Container>
            <Row className="row-grid align-items-center mb-5">
              <Col lg="12">
                <h3 className="text-primary font-weight-light mb-2">
                  Thank you for using our service!
                </h3>
                <h4 className="mb-0 font-weight-light">
                  We wish you a comfortable stay.
                </h4>
              </Col>
              
            </Row>
            <hr />
            <Row className="align-items-center justify-content-md-between">
              <Col md="6">
                <div className="copyright">
                  © {new Date().getFullYear()}{" "}
                  <a
                    href="https://github.com/Moeez-Muslim"
                    target="_blank"
                  >
                    tv-time
                  </a>
                </div>
              </Col>
              <Col md="6">
                <Nav className="nav-footer justify-content-end">
                  <NavItem>
                    <NavLink
                      href="https://github.com/Moeez-Muslim"
                      target="_blank"
                    >
                      Creative Tim
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      href="https://www.creative-tim.com/presentation?ref=adsr-footer"
                      target="_blank"
                    >
                      About Us
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      href="https://github.com/Moeez-Muslim"
                      target="_blank"
                    >
                      MIT License
                    </NavLink>
                  </NavItem>
                </Nav>
              </Col>
            </Row>
          </Container>
        </footer>
      </>
    );
  }
}

export default SimpleFooter;
