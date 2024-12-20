import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from "react-router-dom"; // For navigation after login
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col,
  Alert,
} from "reactstrap";
import LoginNavbar from '../Navbars/LoginNavbar'

const Login = () => {
  const { t } = useTranslation(); // Initialize useTranslation

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State to handle error messages
  const [isLoading, setIsLoading] = useState(false); // State to handle loading state
  const [emailError, setEmailError] = useState(""); // Email validation error state
  const [passwordError, setPasswordError] = useState(""); // Password validation error state
  const [googleError, setGoogleError] = useState("");
  const navigate = useNavigate(); // Hook to navigate after login

  // Function to validate email
  const validateEmail = (email) => {
    // Simple regex for email validation
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  // Function to handle form submission
  const handleLogin = async () => {
    setErrorMessage("");

    // Input validation
    if (!email) {
      setEmailError("Email is required.");
      return;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email format.");
      return;
    } else {
      setEmailError(""); // Clear email error if valid
    }

    if (!password) {
      setPasswordError("Password is required.");
      return;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    } else {
      setPasswordError(""); // Clear password error if valid
    }

    setIsLoading(true); // Start loading state

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/users/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // If login is successful, store the JWT token in localStorage
      localStorage.setItem("token", response.data.token);

      // Decode the token to check if the user is an admin
      const decodedToken = jwtDecode(response.data.token);
      console.log(decodedToken)

      // Check if the token contains `isAdmin: true` and navigate accordingly
      if (decodedToken.isAdmin) {
        navigate("/admin"); // Navigate to /admin if user is an admin
      } else {
        navigate("/"); // Navigate to home if user is not an admin
      }

    } catch (error) {
      // Handle error (invalid credentials, server error, etc.)
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.msg);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false); // Stop loading state
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Decode the credential response
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name: fullName } = decoded; // Extract email and full name
      
      // Send extracted data to your backend
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/users/google-signin`, {
        fullName,
        email,
      });

      // Handle successful login: store JWT token and proceed
      const { token } = response.data;

      // If login is successful, store the JWT token in localStorage
      localStorage.setItem("token", response.data.token);

      // Redirect user to the homepage or another route
      navigate("/");

      // Redirect user or perform post-login action here

    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  const handleGoogleFailure = () => {
    setGoogleError("Google Sign In Failed");
  };

  // Check if email and password are filled before enabling the button
  const isFormValid = email && password && !isLoading;

  return (
    <>
      <LoginNavbar/>
      <main>
        <section className="section section-shaped section-lg">
          <div className="shape shape-style-1 bg-gradient-default">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <Container className="pt-lg-7">
            <Row className="justify-content-center">
              <Col lg="5">
                <Card className="bg-secondary shadow border-0">
                  <CardHeader className="bg-white pb-5">
                    <div className="text-muted text-center mb-3">
                      <small>{t("signInWith")}</small>
                    </div>
                    <div className="btn-wrapper text-center ml-5">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                      />
                    </div>
                    {googleError && <Alert color="danger">{t("googleSignInError")}</Alert>}
                  </CardHeader>
                  <CardBody className="px-lg-5 py-lg-5">
                    <div className="text-center text-muted mb-4">
                      <small>{t("orSignInWithCredentials")}</small>
                    </div>
                    <Form role="form">
                      <FormGroup className="mb-3">
                        <InputGroup className="input-group-alternative">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="ni ni-email-83" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            placeholder={t("emailPlaceholder")}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </InputGroup>
                        {emailError && <Alert color="danger">{t("emailValidationError")}</Alert>}
                      </FormGroup>
                      <FormGroup>
                        <InputGroup className="input-group-alternative">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="ni ni-lock-circle-open" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            placeholder={t("passwordPlaceholder")}
                            type="password"
                            autoComplete="off"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </InputGroup>
                        {passwordError && <Alert color="danger">{t("passwordValidationError")}</Alert>}
                      </FormGroup>
                      {errorMessage && <Alert color="danger">{t("backendError")}</Alert>}
                      <div className="text-center">
                        <Button
                          className="my-4"
                          color="primary"
                          type="button"
                          onClick={handleLogin}
                          disabled={!isFormValid}
                        >
                          {isLoading ? t("signingIn") : t("signInButton")}
                        </Button>
                      </div>
                    </Form>
                  </CardBody>
                </Card>
                <Row className="mt-3">
                  <Col xs="6">
                    <a
                      className="text-light"
                      href="#pablo"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/privacy-policy'); // Navigate to the privacy-policy route
                      }}
                    >
                      <small>{t("privacyPolicy")}</small>
                    </a>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    </>
  );
};

export default Login;
