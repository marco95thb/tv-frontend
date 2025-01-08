import React, { useState, useEffect, useRef } from "react";
import { Spinner, Container, Row, Col, Form, FormGroup, Input, Label, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Table } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import DemoNavbar from "../Navbars/DemoNavbar";
import SimpleFooter from "../Footers/SimpleFooter";
import SignupNavbar from "../Navbars/SignupNavbar";
import { useTranslation } from "react-i18next"; // Import useTranslation

const Index = () => {
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [hours, setHours] = useState(0);
  const [tvNumber, setTvNumber] = useState("");
  const [newTvNumber, setNewTvNumber] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [thresholds, setThresholds] = useState([]);
  const [orders, setOrders] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(10); // Default hourly rate
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // For showing loading state
  const [loadingOrders, setLoadingOrders] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for button

  const [modalOrderId, setModalOrderId] = useState(null); // To track the order for which OTP is entered
  const [otp, setOtp] = useState(""); // OTP input
  const [modalErrorMessage, setModalErrorMessage] = useState(""); // Error message for the modal
  const [modalSuccessMessage, setModalSuccessMessage] = useState(""); // Success message for the modal
  const [showOtpModal, setShowOtpModal] = useState(false); // For showing the OTP modal

  const navigate = useNavigate(); // Define navigate

  useEffect(() => {
    /* Initialize Google One Tap Sign-In */
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID, // Replace with your client ID
      callback: handleCredentialResponse,
    });

    // Show the One Tap prompt
    window.google.accounts.id.prompt();
  }, []);

  const handleCredentialResponse = async (credentialResponse) => {
    try {
      // Decode the credential response
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name: fullName } = decoded; // Extract email and full name

      // Send extracted data to your backend
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/users/google-signin`,
        {
          fullName,
          email,
        }
      );

      // Handle successful login: store JWT token and proceed
      const { token } = response.data;

      // Store the JWT token in localStorage
      localStorage.setItem("token", token);

      // Decode the token to check if the user is an admin
      const decodedToken = jwtDecode(token);

      // Navigate based on user role
      if (decodedToken.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error during One Tap sign-in:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true); // Valid token
        } else {
          localStorage.removeItem("token"); // Expired token
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false); // Invalid token
      }
    } else {
      setIsLoggedIn(false); // No token
    }
  }, []);
  

  // Fetch thresholds when the component loads
  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/rates/rate`);
        setThresholds(response.data.thresholds);
      } catch (error) {
        setErrorMessage('Failed to load rates.');
      }
    };

    fetchThresholds();
  }, []);

  // Handle hours change and calculate subtotal
  const handleHoursChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setHours(value > 0 ? value : 0);
    calculateSubtotal(value);
  };

  const calculateSubtotal = (days) => {
    if (!thresholds.length || days <= 0) {
      setSubtotal(0); // Set subtotal to 0 if thresholds are not available or days are invalid
      return;
    }
  
    let price = 0;
  
    // Sort thresholds to ensure they are ordered correctly
    const sortedThresholds = thresholds.sort((a, b) => a.days - b.days);
  
    // Find the applicable rate based on thresholds
    for (const threshold of sortedThresholds) {
      if (days <= threshold.days) {
        price = threshold.price;
        break;
      }
    }
  
    // If no matching threshold is found, use the last threshold's price
    if (!price) {
      price = sortedThresholds[sortedThresholds.length - 1].price;
    }
  
    // Calculate subtotal based on the applicable price and hours
    setSubtotal(price * days);
  };
  

  // Calculate subtotal dynamically based on hours and thresholds
  useEffect(() => {
    calculateSubtotal(hours); // Recalculate subtotal whenever hours or thresholds change
  }, [hours, thresholds]);

  const jwtToken = localStorage.getItem("token"); // Get JWT token from localStorage

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/orders/my-orders`, {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": jwtToken,
          },
        });

        setOrders(response.data); // Set orders in state
      } catch (error) {
        setErrorMessage(
          error.response && error.response.data ? error.response.data.msg : "Error fetching orders."
        );
      } finally {
        setLoadingOrders(false); // Stop loading state for orders
      }
    };

    fetchOrders();
  }, [jwtToken]);

  const [expandedOrders, setExpandedOrders] = useState([]); // Store which orders are expanded

  const toggleExpand = (index) => {
    if (expandedOrders.includes(index)) {
      setExpandedOrders(expandedOrders.filter((i) => i !== index)); // Collapse
    } else {
      setExpandedOrders([...expandedOrders, index]); // Expand
    }
  };

const handleProceedToBuy = async () => {
  setIsLoading(true); // Start loading state
  setSuccessMessage("");
  setErrorMessage("");

  try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/orders/create-checkout-session`,
        {
          timeBought: hours,
          tvNumber: tvNumber,
          language: i18n.language,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": jwtToken,
          },
        }
      );

      // Redirect to Stripe Checkout
    const { checkoutUrl } = response.data; // Ensure the server responds with a `checkoutUrl`
    if (checkoutUrl) {
      window.location.href = checkoutUrl; // Redirect to the Stripe Checkout page
    } else {
      throw new Error("Checkout URL not received");
    }
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    setErrorMessage(
      error.response ? error.response.data : error.message, t("orderPlacedError")
    );
  } finally {
    setIsLoading(false); // End loading state
  }
};

useEffect(() => {
  const query = new URLSearchParams(window.location.search);

  if (query.get("success")) {
    setSuccessMessage(t("orderPlacedSuccess"));

    // Reset form
    setHours(0);
    setTvNumber("");
  } else if (query.get("canceled")) {
    setErrorMessage(t("orderPlacedError"));
  }

  // Clear query parameters after handling
  //window.history.replaceState({}, document.title, "/");
}, [t, i18n.language]); 


  // Create refs for cart and orders sections
  const cartSectionRef = useRef(null);
  const ordersSectionRef = useRef(null);

  const scrollToCart = () => {
    cartSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToOrders = () => {
    ordersSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // Handle change room
  const handleChangeRoom = (orderId) => {
    setModalOrderId(orderId);
    // Reset modal state to default when "Change Room" is clicked
    setOtp("");  // Clear OTP input
    setNewTvNumber("");  // Clear new room number input
    setModalErrorMessage("");  // Clear any previous error message
    setModalSuccessMessage("");  // Clear the success message to show the Submit button
    setShowOtpModal(true);  // Show the OTP modal
  };

  const handleOtpSubmit = async () => {
    setLoading(true); // Start loading
    setModalErrorMessage(""); // Clear previous errors
    setModalSuccessMessage(""); // Clear previous success messages
  
    try {
      console.log({
        modalOrderId,
        otp,
        newTvNumber,
      });
  
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/orders/change-room`,
        {
          orderId: modalOrderId,
          otp: Number(otp), // Ensure OTP is a number
          newTvNumber,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": jwtToken,
          },
        }
      );
  
      const result = response.data;
  
      if (result.success) {
        // Success handling
        setModalSuccessMessage(t("roomChangeSuccess"));
        setModalErrorMessage(""); // Clear error message
  
        const updatedOrder = result.order;
  
        // Update orders state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === modalOrderId ? updatedOrder : order
          )
        );
      } else {
        // Handle API failure with device connection check
        setModalErrorMessage(
          result.message ||
            t("contactAdmin")
        );
      }
    } catch (error) {
      console.error("Failed to change room:", error.message);
  
      // Handle error responses
      setModalErrorMessage(
        error.response && error.response.data
          ? error.response.data.message
          : t("otpVerificationError")
      );
    } finally {
      setLoading(false); // End loading
    }
  };
  
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };
  

  return (
    <>
      {isLoggedIn ? <DemoNavbar /> : <SignupNavbar />}
      <main>
        {/* Hero Section */}
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
                    <img
                      alt="..."
                      className="img-fluid"
                      src={require("../../assets/img/brand/argon-react-white.png")}
                      style={{ width: "200px" }}
                    />
                    <p className="lead text-white">
                      {t("welcome")}
                    </p>
                    <div className="btn-wrapper mt-5">
                      <Button
                        className="btn-white btn-icon mb-3 mb-sm-0 mb-lg-3"
                        color="default"
                        size="lg"
                        onClick={() => (isLoggedIn ? scrollToCart() : navigate("/login-page"))}
                      >
                        <span className="btn-inner--icon mr-1">
                          <i className="fa fa-shopping-cart" />
                        </span>
                        <span className="btn-inner--text">  {t("buyTvTime")} </span>
                      </Button>{"    "}
                      <Button
                        className="btn-icon mb-3 mb-sm-0 mb-lg-3"
                        color="github"
                        size="lg"
                        onClick={() => (isLoggedIn ? scrollToOrders() : navigate("/login-page"))}
                      >
                        <span className="btn-inner--icon mr-1">
                          <i className="fa fa-list" />
                        </span>
                        <span className="btn-inner--text">  {t("myOrders")}  </span>
                      </Button>{"    "}
                      <Button
                        className="btn-icon mb-3 mb-sm-0 mb-lg-3"
                        color="default"
                        size="lg"
                        onClick={() => navigate("/remote")} // Navigate to /remote on click
                      >
                        <span className="btn-inner--icon mr-1">
                          <i className="fa fa-tv" />
                        </span>
                        <span className="btn-inner--text">{t("remote")}</span>
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            </Container>
            <div className="separator separator-bottom separator-skew zindex-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                version="1.1"
                viewBox="0 0 2560 100"
                x="0"
                y="0"
              >
                <polygon className="fill-white" points="2560 0 2560 100 0 100" />
              </svg>
            </div>
          </section>
        </div>

        {isLoggedIn && (
        
        <section className="section" ref={cartSectionRef}>
          {/* Cart-like Feature */}
          <Container>
            <Row className="justify-content-center">
              <Col lg="6">
                <h3 className="text-center">{t("buyTvTime")}</h3>

                {/* Rates Table */}
                <Table striped>
                  <thead>
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
                          <td>
                            {minDays}-{maxDays}
                          </td>
                          <td>€{threshold.price}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                <Form>
                  {/* Hours Input Field */}
                  <FormGroup>
                    <Label for="hours">{t("enterHours")}</Label>
                    <Input
                      type="number"
                      id="hours"
                      value={hours}
                      onChange={handleHoursChange}
                      placeholder={t("enterNumHours")}
                      min="0"
                    />
                  </FormGroup>

                  {/* TV Number */}
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <Label for="tvNumber">{t("tvNumber")}</Label>
                        <Input
                          type="text"
                          id="tvNumber"
                          value={tvNumber}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,4}$/.test(value)) { // Allows only up to 4 digits
                              setTvNumber(value);
                            }
                          }}
                          placeholder={t("enter4DigitNum")}
                          maxLength="4" // Ensures input is capped at 4 characters
                        />
                      </FormGroup>
                    </Col>
                  </Row>


                  {/* Display subtotal and Buy button */}
                  <div className="text-center">
                    <p>{t("subtotal")}<strong>€{subtotal}</strong></p>
                    {successMessage && <Alert color="success">{successMessage}</Alert>}
                    {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
                    <Button
                      color="primary"
                      disabled={hours === 0 || tvNumber.length !== 4 || isLoading}
                      onClick={handleProceedToBuy}
                    >
                      {isLoading ? `${t("placingOrder")}` : `${t("proceedToBuy")}`}
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </Container>
        </section>
        )}
        
        {isLoggedIn && (
        <section className="section section-shaped" ref={ordersSectionRef}>
          {/* Orders Section */}
        <div className="shape shape-style-1 shape-default">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <Container>
          <Row className="justify-content-center">
            <Col lg="9">
              <h3 className="text-center">{t("yourOrders")}</h3>
              {orders.length === 0 ? (
                <h6 className="text-center">{t("noOrders")}</h6>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table
                    responsive
                    className="table-bordered table-opacity"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.60)',
                      borderRadius: '10px',
                    }}
                  >
                    <thead>
                      <tr>
                        <th>{t("clickToExpand")}</th>
                        <th>{t("timeBought")}</th>
                        <th>{t("totalCost")}</th>
                        <th>{t("tvNumber")}</th>
                        <th>{t("orderDate")}</th>
                        <th>{t("changeTv")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => {
                        return (
                          <React.Fragment key={index}>
                            {/* Display the latest TV number with dropdown icon */}
                            <tr>
                              <td>
                                {order.tvNumber.length > 1 && (
                                  <Button
                                    className="btn-icon mb-3 mb-sm-0"
                                    color="primary"
                                    size="sm" // Using 'sm' for smaller size
                                    onClick={() => toggleExpand(index)}
                                    style={{
                                      padding: '0 10px',
                                      marginLeft: '25px',
                                      marginTop: '10px',
                                    }} // Adjust padding and margin as needed
                                  >
                                    <span className="btn-inner--icon m-2">
                                      <i
                                        className={
                                          expandedOrders.includes(index)
                                            ? 'fa fa-chevron-up'
                                            : 'fa fa-chevron-down'
                                        }
                                      />
                                    </span>
                                  </Button>
                                )}
                              </td>
                              <td>{order.timeBought}</td>
                              <td>${order.totalCost}</td>
                              <td>{order.tvNumber[0]}</td>
                              <td>{formatDate(order.orderDate)}</td>
                              <td>
                                <Button
                                  color="primary"
                                  onClick={() => handleChangeRoom(order._id)}
                                >
                                  {t("changeTv")}
                                </Button>
                              </td>
                            </tr>

                            {/* Conditionally show previous TV numbers */}
                            {expandedOrders.includes(index) &&
                              order.tvNumber.slice(1).map((tv, i) => (
                                <tr key={`${index}-${i}`} className="previous-entries">
                                  <td></td>
                                  <td></td> {/* Empty cell for Time Bought */}
                                  <td></td> {/* Empty cell for Total Cost */}
                                  <td>{tv}</td>
                                  <td></td> {/* Empty cell for Order Date */}
                                  <td>{t("previousTV")}</td>
                                </tr>
                              ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Col>
          </Row>
        </Container>

        {/* OTP Modal for Changing Room */}
        <Modal isOpen={showOtpModal} toggle={() => setShowOtpModal(!showOtpModal)}>
          <ModalHeader toggle={() => setShowOtpModal(!showOtpModal)}>
            {t("enterOTP")}
          </ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label for="otp">{t("otpReceived")}</Label>
                <Input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,6}$/.test(value)) { // Allows only up to 4 digits
                      setOtp(value);
                    }
                  }}                    
                  placeholder={t("enter6DigitOtp")}
                  disabled={modalSuccessMessage ? true : false} // Disable input after success
                />
              </FormGroup>
              
              <FormGroup>
                <Label for="newTvNumber">{t("newTvNum")}</Label>
                <Input
                  type="text"
                  id="newTvNumber"
                  value={newTvNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,4}$/.test(value)) { // Allows only up to 4 digits
                      setNewTvNumber(value);
                    }
                  }}                    placeholder={t("enter4DigitNum")}
                  disabled={modalSuccessMessage ? true : false} // Disable input after success
                />
              </FormGroup>
              {modalErrorMessage && <Alert color="danger">{modalErrorMessage}</Alert>}
              {modalSuccessMessage && <Alert color="success">{modalSuccessMessage}</Alert>}
            </Form>
          </ModalBody>
          <ModalFooter>
            {!modalSuccessMessage && (
              <Button
              color="primary"
              onClick={handleOtpSubmit}
              disabled={
                loading || newTvNumber.length !== 4 || otp.length !== 6 // Disable when loading or input invalid
              }
            >
              {loading ? (
                <Spinner size="sm" /> // Show spinner when loading
              ) : (
                t("Submit") // Default label
              )}
            </Button>              
            )}
            <Button color="secondary" onClick={() => setShowOtpModal(false)}>
              {modalSuccessMessage ? `${t("close")}` : `${t("cancel")}`}
            </Button>
          </ModalFooter>
        </Modal>
      </section>
        )}

      </main>
      <SimpleFooter />
    </>
  );
};

export default Index;
