import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, FormGroup, Input, Label, Button, Table, Alert, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DemoNavbar from "components/Navbars/DemoNavbar";
import SimpleFooter from "components/Footers/SimpleFooter.js";

import beep1 from "./beep.mp3"; 
import beep2 from "./beep.mp3"; 
import beep3 from "./beep.mp3"; 
import beep4 from "./beep.mp3"; 
import beep5 from "./beep.mp3"; 
import beep6 from "./beep.mp3"; 
import beep7 from "./beep.mp3"; 
import beep8 from "./beep.mp3"; 
import beep9 from "./beep.mp3"; 


const Index = () => {
  const [hours, setHours] = useState(0);
  const [roomNumber, setRoomNumber] = useState("");
  const [tvNumber, setTvNumber] = useState("");
  const [newTvNumber, setNewTvNumber] = useState("");
  const [orders, setOrders] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(10); // Default hourly rate
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // For showing loading state
  const [loadingOrders, setLoadingOrders] = useState(true); // For loading state of orders

  const [modalOrderId, setModalOrderId] = useState(null); // To track the order for which OTP is entered
  const [otp, setOtp] = useState(""); // OTP input
  const [newRoomNumber, setNewRoomNumber] = useState(""); // New room number for change
  const [modalErrorMessage, setModalErrorMessage] = useState(""); // Error message for the modal
  const [modalSuccessMessage, setModalSuccessMessage] = useState(""); // Success message for the modal
  const [showOtpModal, setShowOtpModal] = useState(false); // For showing the OTP modal

  const navigate = useNavigate(); // Define navigate

  // Fetch the hourly rate on component mount
  useEffect(() => {
    const fetchHourlyRate = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/rates/rate`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setHourlyRate(response.data.hourlyRate); // Update the hourly rate with fetched data
      } catch (error) {
        setErrorMessage(
          error.response && error.response.data ? error.response.data.msg : "Error fetching hourly rate."
        );
      }
    };

    fetchHourlyRate();
  }, []);

  const handleHoursChange = (e) => {
    const value = e.target.value;
    if (value >= 0) setHours(value);
  };

  const handleRoomChange = (e) => {
    setRoomNumber(e.target.value);
  };

  const subtotal = hours * hourlyRate;
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
        `${process.env.REACT_APP_BASE_URL}/api/orders/buy-tv-time`,
        {
          timeBought: hours,
          roomNumber: roomNumber,
          tvNumber: tvNumber
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": jwtToken,
          },
        }
      );

      // Success handling
      const newOrder = response.data;
      setSuccessMessage("Order placed successfully! Your OTP has been sent via email.");
      setOrders((prevOrders) => [...prevOrders, newOrder]); // Update the orders with the new order

      // Reset form
      setHours(0);
      setRoomNumber("");
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      setErrorMessage(
        error.response && error.response.data ? error.response.data.msg : "Failed to place order. Please try again."
      );
    } finally {
      setIsLoading(false); // End loading state
    }
  };

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
    setNewRoomNumber("");  // Clear new room number input
    setModalErrorMessage("");  // Clear any previous error message
    setModalSuccessMessage("");  // Clear the success message to show the Submit button
    setShowOtpModal(true);  // Show the OTP modal
  };

  const handleOtpSubmit = async () => {

    try {
      console.log({
        modalOrderId,
        otp,
        newRoomNumber,
        newTvNumber
      })
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/orders/change-room`,
        {
          orderId: modalOrderId,
          otp: Number(otp),  // Convert to number
          newRoomNumber: Number(newRoomNumber),  // Convert to number
          newTvNumber: Number(newTvNumber)
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": jwtToken,
          },
        }
      );

      setModalErrorMessage(""); 
      // Success handling
      setModalSuccessMessage("Room number changed successfully!");

      const updatedOrder = response.data.order;


      // Update orders state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === modalOrderId ? updatedOrder : order
        )
      );

      
    } catch (error) {
      setModalErrorMessage(
        error.response && error.response.data ? error.response.data.msg : "OTP verification failed."
      );
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const [showRemoteModal, setShowRemoteModal] = useState(false); // Modal state for remote
  const beepSounds = [beep1, beep2, beep3, beep4, beep5, beep6, beep7, beep8, beep9]; // Array of beep sounds

  // Function to toggle the remote modal visibility
  const toggleRemoteModal = () => {
    setShowRemoteModal(!showRemoteModal);
  };

  // Function to play beep sound based on button number
  const playBeep = (index) => {
    const audio = new Audio(beepSounds[index]);
    audio.play();
  };

  return (
    <>
      <DemoNavbar scrollToCart={scrollToCart}  />
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
                      src={require("assets/img/brand/argon-react-white.png")}
                      style={{ width: "200px" }}
                    />
                    <p className="lead text-white">
                      Have a comfortable stay and stay entertained with smart TV in your room.
                    </p>
                    <div className="btn-wrapper mt-5">
                      <Button
                        className="btn-white btn-icon mb-3 mb-sm-0"
                        color="default"
                        size="lg"
                        onClick={scrollToCart}
                      >
                        <span className="btn-inner--icon mr-1">
                          <i className="fa fa-shopping-cart" />
                        </span>
                        <span className="btn-inner--text">Buy TV Time</span>
                      </Button>{" "}
                      <Button
                        className="btn-icon mb-3 mb-sm-0"
                        color="github"
                        size="lg"
                        onClick={scrollToOrders}
                      >
                        <span className="btn-inner--icon mr-1">
                          <i className="fa fa-list" />
                        </span>
                        <span className="btn-inner--text">My Orders</span>
                      </Button>
                      <Button
                        className="btn-icon mb-3 mb-sm-0"
                        color="default"
                        size="lg"
                        onClick={() => navigate("/remote")} // Navigate to /remote on click
                      >
                        <span className="btn-inner--icon mr-1">
                          <i className="fa fa-tv" />
                        </span>
                        <span className="btn-inner--text">Remote</span>
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

        
        {/* Cart-like Feature */}
        <section className="section" ref={cartSectionRef}>
          <Container>
            <Row className="justify-content-center">
              <Col lg="6">
                <h3 className="text-center">Buy TV Time</h3>
                <Form>
                  {/* Hours Input Field */}
                  <FormGroup>
                    <Label for="hours">Enter Hours of TV Time</Label>
                    <Input
                      type="number"
                      id="hours"
                      value={hours}
                      onChange={handleHoursChange}
                      placeholder="Enter number of hours"
                      min="0"
                    />
                  </FormGroup>

                  {/* Room Number and TV Number in the same row */}
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="roomNumber">Room Number</Label>
                        <Input
                          type="number"
                          id="roomNumber"
                          value={roomNumber}
                          onChange={handleRoomChange}
                          placeholder="Enter room number"
                          min="0"
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="tvNumber">TV Number</Label>
                        <Input
                          type="number"
                          id="tvNumber"
                          value={tvNumber}
                          onChange={(e) => setTvNumber(e.target.value)}
                          placeholder="Enter TV number"
                          min="0"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  {/* Display subtotal and Buy button */}
                  <div className="text-center">
                    <p>Cost per hour: <strong>€{hourlyRate}</strong></p>
                    <p>Subtotal: <strong>€{subtotal}</strong></p>
                    {successMessage && <Alert color="success">{successMessage}</Alert>}
                    <Button
                      color="primary"
                      disabled={hours === 0 || roomNumber === "" || tvNumber === "" || isLoading}
                      onClick={handleProceedToBuy}
                    >
                      {isLoading ? "Placing Order..." : "Proceed to Buy"}
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </Container>
        </section>


        {/* Orders Section */}
        <section className="section section-shaped" ref={ordersSectionRef}>
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
                <h3 className="text-center">Your Orders</h3>
                {orders.length === 0 ? (
                  <h6 className="text-center">No orders placed yet.</h6>
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
                        <th>Click to expand previous room/tv</th>
                        <th>Time Bought (Hours)</th>
                        <th>Total Cost</th>
                        <th>Room Number</th>
                        <th>TV Number</th>
                        <th>Order Date</th>
                        <th>Change Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => {
                        return (
                          <React.Fragment key={index}>
                            {/* Display the latest room and tv number with dropdown icon */}
                            <tr>
                              <td>{' '}
                                {order.roomNumber.length > 1 && (
                                  <Button
                                  className="btn-icon mb-3 mb-sm-0"
                                  color="primary"
                                  size="sm" // Using 'sm' for smaller size
                                  onClick={() => toggleExpand(index)}
                                  style={{ padding: '0 10px', marginLeft: '25px', marginTop: '10px' }} // You can adjust padding and margin as needed
                                >
                                  <span className="btn-inner--icon m-2">
                                    <i className={expandedOrders.includes(index) ? 'fa fa-chevron-up' : 'fa fa-chevron-down'} />
                                  </span>
                                </Button>
                                )}</td>
                              <td>{order.timeBought}</td>
                              <td>${order.totalCost}</td>
                              <td>
                                {order.roomNumber[0]}
                              </td>
                              <td>{order.tvNumber[0]}</td>
                              <td>{formatDate(order.orderDate)}</td>
                              <td>
                                <Button color="primary" onClick={() => handleChangeRoom(order._id)}>
                                  Change Room
                                </Button>
                              </td>
                            </tr>

                            {/* Conditionally show previous room and TV numbers */}
                            {expandedOrders.includes(index) &&
                              order.roomNumber.slice(1).map((room, i) => (
                                <tr key={`${index}-${i}`} className="previous-entries">
                                  <td></td>
                                  <td></td> {/* Empty cell for Time Bought */}
                                  <td></td> {/* Empty cell for Total Cost */}
                                  <td>{order.roomNumber[i + 1]}</td>
                                  <td>{order.tvNumber[i + 1]}</td>
                                  <td></td> {/* Empty cell for Order Date */}
                                  <td>
                                    Previous Room & TV
                                  </td>
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
              Enter OTP you received when placing the order
            </ModalHeader>
            <ModalBody>
              <Form>
                <FormGroup>
                  <Label for="otp">OTP received in email</Label>
                  <Input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={modalSuccessMessage ? true : false} // Disable input after success
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="newRoomNumber">New Room Number</Label>
                  <Input
                    type="text"
                    id="newRoomNumber"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    disabled={modalSuccessMessage ? true : false} // Disable input after success
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="newTvNumber">New TV Number</Label>
                  <Input
                    type="text"
                    id="newTvNumber"
                    value={newTvNumber}
                    onChange={(e) => setNewTvNumber(e.target.value)}
                    disabled={modalSuccessMessage ? true : false} // Disable input after success
                  />
                </FormGroup>
                {modalErrorMessage && <Alert color="danger">{modalErrorMessage}</Alert>}
                {modalSuccessMessage && <Alert color="success">{modalSuccessMessage}</Alert>}
              </Form>
            </ModalBody>
            <ModalFooter>
              {!modalSuccessMessage && (
                <Button color="primary" onClick={handleOtpSubmit}>
                  Submit
                </Button>
              )}
              <Button color="secondary" onClick={() => setShowOtpModal(false)}>
                {modalSuccessMessage ? 'Close' : 'Cancel'}
              </Button>
            </ModalFooter>
          </Modal>
        </section>

      </main>
      <SimpleFooter />
    </>
  );
};

export default Index;
