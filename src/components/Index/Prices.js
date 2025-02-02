import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import DemoNavbar from "../Navbars/DemoNavbar";
import SimpleFooter from "../Footers/SimpleFooter";
import SignupNavbar from "../Navbars/SignupNavbar";
import { useTranslation } from "react-i18next";

const Prices = () => {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [thresholds, setThresholds] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/rates/rate`);
        setThresholds(response.data.thresholds);
      } catch (error) {
        setErrorMessage("Failed to load rates.");
      }
    };

    fetchThresholds();
  }, []);

  return (
    <>
      {isLoggedIn ? <DemoNavbar /> : <SignupNavbar />}
      <main>
        <div className="position-relative">
          <section className="section section-hero section-shaped">
            <div className="shape shape-style-1 shape-default">
              <span className="span-150" />
              <span className="span-50" />
              <span className="span-50" />
              <span className="span-75" />
              <span className="span-100" />
              <span className="span-75" />
              <span className="span-50" />
              <span className="span-100" />
              <span className="span-50" />
              <span className="span-100" />
            </div>
            <Container className="shape-container d-flex align-items-center py-lg">
              <div className="col px-0">
                <Row className="align-items-center justify-content-center">
                  <Col className="text-center" lg="6">
                    <h2>{t("pricing")}</h2>
                    <Table responsive bordered hover className="custom-table">
                      <thead className="table-header">
                        <tr>
                          <th>{t("days")}</th>
                          <th>{t("pricePerDay")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {thresholds.map((threshold, index) => {
                          const minDays = index === 0 ? 0 : thresholds[index - 1].days + 1;
                          const maxDays = threshold.days;
                          return (
                            <tr key={index}>
                              <td>{minDays}-{maxDays}</td>
                              <td>€{threshold.price}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </div>
            </Container>
            {/* <div className="separator separator-bottom separator-skew zindex-100">
              <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 2560 100">
                <polygon className="fill-white" points="2560 0 2560 100 0 100" />
              </svg>
            </div> */}
          </section>
        </div>
      </main>
      <SimpleFooter />

      <style jsx>{`
        .custom-table {
          background-color: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .custom-table th,
        .custom-table td {
          text-align: center;
          padding: 15px;
          font-weight: bold;
          color: #333;
        }

        .custom-table thead {
          background-color: rgba(255, 255, 255, 0.3);
          color: white;
        }

        .custom-table tbody tr:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
};

export default Prices;
