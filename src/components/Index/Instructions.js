import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import InstructionsNavbar_Demo from "../Navbars/InstructionsNavbar_Demo"
import SimpleFooter from "../Footers/SimpleFooter";
import InstructionsNavbarSignup from "../Navbars/InstructionsNavbar_Signup"
import SignupNavbar from "../Navbars/SignupNavbar"
import { useTranslation } from "react-i18next";
import { Trans } from 'react-i18next';

const Instructions = () => {
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
      {isLoggedIn ? <InstructionsNavbar_Demo /> : <InstructionsNavbarSignup />}
      <Container className="my-5">
        <Row className="align-items-center">
          <Col md="6" className="text-left">
            <img
              src={require("../../assets/img/brand/attiva_logo.jpg")}
              alt="Servizio Sanitario Regionale Emilia-Romagna"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </Col>

          <Col md="6" className="text-center text-md-center">
            <h3 style={{ fontWeight: "bold" }}>TECNO SERVICE</h3>
            <p style={{ margin: 0 }}>{t('byMartino')}</p>
            <p style={{ fontStyle: "italic", margin: 0 }}>{t('tvManagement')}</p>
            <p style={{ fontWeight: "bold", fontStyle: "italic" }}>Tel <span style={{ fontWeight: "bold" }}>059 4223501</span></p>
          </Col>
        </Row>

        <Row className="mt-4" style={{marginRight:"10px", marginLeft:"10px"}}>
          <Col className="text-left">
            <p style={{ fontSize: "1.2rem" }}>
              {t('dearGuest')}
            </p>
            <p style={{ fontSize: "1.2rem" }}>
                <Trans i18nKey="pleasantStay" components={{ strong: <strong /> }}/>
            </p>
          </Col>
        </Row>

        <Row className="mt-4 justify-content-between" style={{ marginRight: "10px", marginLeft: "10px" }}>
        {/* Left-Aligned Column */}
        <Col md="6" className="d-flex me-auto" style={{ padding: "10px", backgroundColor: "#b4c6e7", marginBottom: "10px" }}>
            <Col xs="4" className="text-center">
            <img
                src={require("../../assets/img/brand/power_button.png")}
                alt="Accensione Icon"
                style={{ maxWidth: "100%", height: "auto" }}
            />
            </Col>
            <Col xs="8">
            <h5 style={{ fontWeight: "bold" }}>{t('ignition')}</h5>
            <p><Trans i18nKey="registrationRequired" components={{ strong: <strong /> }}/></p>
            <p><Trans i18nKey="setDays" components={{ strong: <strong /> }}/></p>
            <p><Trans i18nKey="noteTvNumber" components={{ strong: <strong /> }}/></p>
            <p><Trans i18nKey="proceedWithPayment" components={{ strong: <strong /> }}/></p>
            </Col>
        </Col>

        {/* Right-Aligned Column */}
        <Col md="5" className="d-flex ms-auto" style={{ backgroundColor: "#c5e0b3", padding: "10px", marginBottom: "10px" }}>
            <Col xs="4" className="text-center">
            <img
                src={require("../../assets/img/brand/remote.png")}
                alt="Remote Icon"
                style={{ maxWidth: "100%", height: "auto" }}
            />
            </Col>
            <Col xs="8">
            <p><Trans i18nKey="remoteNearby" components={{ strong: <strong /> }}/></p>
            <p><Trans i18nKey="rentRemote" components={{ strong: <strong /> }}/></p>
            </Col>
        </Col>
        </Row>
        <Row className="mt-2" style={{marginRight:"10px", marginLeft:"10px"}}>
          <Col className="text-left">
            <p style={{ fontSize: "1.2rem" }}>
             <Trans i18nKey="useRemote" components={{ strong: <strong /> }}/>
            </p>
          </Col>
        </Row>
        <Row className="mt-2" style={{ backgroundColor: "#f8caac", paddingTop: "10px", marginRight: "10px", marginLeft: "10px"}}>
          <Col xs="3" className="text-center">
            <img
              src={require("../../assets/img/brand/ear.png")}
              alt="Audio Icon"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </Col>
          <Col xs="7" >
            <p><Trans i18nKey="withoutHeadPhones" components={{ strong: <strong /> }}/></p>
            <p><Trans i18nKey="insertJack" components={{ strong: <strong />, em: <em /> }}/></p>
            <p><Trans i18nKey="transmitted" components={{ strong: <strong /> }}/></p>
          </Col>
        </Row>
        <Row className="mt-4" style={{ border: "1px solid black", padding: "15px", marginRight: "10px", marginLeft: "10px" }}>
          <Col style={{marginRight: "10px", marginLeft: "10px"}}>
            <p><Trans i18nKey="entrance1" components={{ strong: <strong /> }}/></p>
            <p><Trans i18nKey="remoteCost" components={{ strong: <strong /> }}/></p>
            <p><Trans i18nKey="refundRemote" components={{ strong: <strong /> }}/></p>
            <p><Trans i18nKey="takeBack" components={{ strong: <strong /> }}/></p>
          </Col>
        </Row>
      </Container>
      <SimpleFooter />
    </>
  );
};

export default Instructions;
