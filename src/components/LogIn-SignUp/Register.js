import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook for navigation
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';
// reactstrap components
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
  Alert, // Import Alert component from reactstrap
} from "reactstrap";

// core components
import SignupNavbar from 'components/Navbars/SignupNavbar';
import SimpleFooter from "components/Footers/SimpleFooter.js";

const Register = () => {
  const { t } = useTranslation(); // Initialize useTranslation

  // State for form inputs, validation errors, and success message
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); // Track signup success
  const [googleError, setGoogleError] = useState("");
  const [passwordError, setPasswordError] = useState(''); // New state for password error
  const [loading, setLoading] = useState(false); // Loading state for submit button




  // useNavigate hook for programmatic navigation
  const navigate = useNavigate();

  // Handle input changes
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'password') {
      handlePasswordStrength(e.target.value);
      setPasswordError(''); // Clear password error on change
    }
  };

  // Password strength logic
  const handlePasswordStrength = (password) => {
    let strength = 'weak';
    if (password.length >= 8) {
      strength = 'strong';
    } else if (password.length >= 6) {
      strength = 'medium';
    }
    setPasswordStrength(strength);
  };

  // Google OAuth handling
  const handleCredentialResponse = (response) => {
    axios.post(`${process.env.REACT_APP_BASE_URL}/auth/google`, { token: response.credential })
      .then(res => {
        console.log('Authenticated', res.data);
      })
      .catch(error => {
        console.error('Authentication failed', error);
      });
  };

  // Form submission handler
  const onSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, phoneNumber, password } = formData;

    // Check if password is at least 6 characters long
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true); // Start loading state

      // Clear email validation error
      setEmailError('');
      setError(null); // Clear any previous errors

      // Make signup request
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/users/signup`, {
        fullName,
        email,
        phoneNumber,
        password
      });
      console.log('User registered:', response.data);

      // Get the JWT token from the response
      const token = response.data.token;

      // Store the JWT token in local storage
      localStorage.setItem('token', token);

      // Set success to true to show the banner
      setSuccess(true);

      // Redirect immediately upon successful signup
      navigate('/');

    } catch (error) {
      console.error('Signup error:', error.response?.data);

      setLoading(false); // Stop loading state if there's an error

      // Handle email already exists error
      if (error.response && error.response.status === 400) {
        setEmailError('Email already exists');
      } else {
        setError('An error occurred during registration. Please try again.');
      }
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


  return (
    <>
      <SignupNavbar/>
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
                      <small>{t("signUpWith")}</small>
                    </div>
                    <div className="btn-wrapper text-center ml-5">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                      />
                    </div>
                  </CardHeader>
                  <CardBody className="px-lg-5 py-lg-5">
                    {success && (
                      <Alert color="success" fade>
                        {t("signupSuccessMessage")}
                      </Alert>
                    )}
                    <div className="text-center text-muted mb-4">
                      <small>{t("orSignUpWithCredentials")}</small>
                    </div>
                    {error && (
                      <div className="text-danger text-center mb-3">
                        <small>{t("errorOccurred")}</small>
                      </div>
                    )}
                    <Form role="form" onSubmit={onSubmit}>
                      <FormGroup>
                        <InputGroup className="input-group-alternative mb-3">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="ni ni-hat-3" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            placeholder={t("fullNamePlaceholder")}
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={onChange}
                            required
                          />
                        </InputGroup>
                      </FormGroup>
                      <FormGroup>
                        <InputGroup className="input-group-alternative mb-3">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="ni ni-email-83" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            placeholder={t("emailPlaceholder")}
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            required
                          />
                        </InputGroup>
                        {emailError && (
                          <div className="text-danger">
                            <small>{t("emailValidationError")}</small>
                          </div>
                        )}
                      </FormGroup>
                      <FormGroup>
                        <InputGroup className="input-group-alternative mb-3">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="ni ni-mobile-button" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            placeholder={t("phoneNumberPlaceholder")}
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={onChange}
                            required
                          />
                        </InputGroup>
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
                            name="password"
                            value={formData.password}
                            onChange={onChange}
                            required
                          />
                        </InputGroup>
                        {passwordError && (
                          <div className="text-danger mt-2">
                            <small>{t("passwordValidationError")}</small>
                          </div>
                        )}
                      </FormGroup>
                      <div className="text-muted font-italic">
                        <small>
                          {t("passwordStrength")}:{" "}
                          <span
                            className={
                              passwordStrength === "strong"
                                ? "text-success font-weight-700"
                                : "text-warning font-weight-700"
                            }
                          >
                            {passwordStrength}
                          </span>
                        </small>
                      </div>
                      <Row className="my-4">
                        <Col xs="12">
                          <div className="custom-control custom-control-alternative custom-checkbox">
                            <input
                              className="custom-control-input"
                              id="customCheckRegister"
                              type="checkbox"
                              required
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="customCheckRegister"
                            >
                              <span>
                                {t("privacyPolicyAgreement")}{" "}
                                <a
                                  href="#pablo"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  {t("privacyPolicy")}
                                </a>
                              </span>
                            </label>
                          </div>
                        </Col>
                      </Row>
                      <div className="text-center">
                        <Button
                          className="mt-4"
                          color="primary"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? t("signingUp") : t("createAccountButton")}
                        </Button>
                      </div>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    </>
  );
};

export default Register;
