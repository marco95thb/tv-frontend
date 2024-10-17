import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, FormGroup, Input, Label, Button, Table, Alert, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import axios from "axios";
import DemoNavbar from "components/Navbars/DemoNavbar.js";
import SimpleFooter from "components/Footers/SimpleFooter.js";

const Index = () => {
  const [hours, setHours] = useState(0);
  const [roomNumber, setRoomNumber] = useState("");
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
      })
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/orders/change-room`,
        {
          orderId: modalOrderId,
          otp: Number(otp),  // Convert to number
          newRoomNumber: Number(newRoomNumber),  // Convert to number
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

      // Update the orders list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === modalOrderId ? { ...order, roomNumber: newRoomNumber } : order
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
                  <FormGroup>
                    <Label for="roomNumber">Enter Room Number</Label>
                    <Input
                      type="text"
                      id="roomNumber"
                      value={roomNumber}
                      onChange={handleRoomChange}
                      placeholder="Enter your room number"
                    />
                  </FormGroup>
                  <div className="text-center">
                    <p>Cost per hour: <strong>${hourlyRate}</strong></p>
                    <p>Subtotal: <strong>${subtotal}</strong></p>
                    {successMessage && <Alert color="success">{successMessage}</Alert>}
                    <Button
                      color="primary"
                      disabled={hours === 0 || roomNumber === "" || isLoading}
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
        <section className="section section-shaped"  ref={ordersSectionRef}>
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
              <Col lg="8">
                <h3 className="text-center">Your Orders</h3>
                {orders.length === 0 ? (
                  <h6 className="text-center">No orders placed yet.</h6>
                ) : (
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
                        <th>Time Bought (Hours)</th>
                        <th>Time Remaining</th>
                        <th>Total Cost</th>
                        <th>Room Number</th>
                        <th>Order Date</th>
                        <th>Change Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <tr key={index}>
                          <td>{order.timeBought}</td>
                          <td>{order.timeRemaining}</td>
                          <td>${order.totalCost}</td>
                          <td>{order.roomNumber}</td>
                          <td>{formatDate(order.orderDate)}</td>
                          <td>
                            {order.timeRemaining > 0 && (
                              <Button
                                color="primary"
                                onClick={() => handleChangeRoom(order._id)}
                              >
                                Change Room
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Col>
            </Row>
          </Container>

      {/* OTP Modal for Changing Room */}
      <Modal isOpen={showOtpModal} toggle={() => setShowOtpModal(!showOtpModal)}>
        <ModalHeader toggle={() => setShowOtpModal(!showOtpModal)}>Enter OTP to Change Room</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="otp">OTP</Label>
              <Input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={modalSuccessMessage ? true : false}  // Disable input after success
              />
            </FormGroup>
            <FormGroup>
              <Label for="newRoomNumber">New Room Number</Label>
              <Input
                type="text"
                id="newRoomNumber"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                disabled={modalSuccessMessage ? true : false}  // Disable input after success
              />
            </FormGroup>
            {modalErrorMessage && <Alert color="danger">{modalErrorMessage}</Alert>}
            {modalSuccessMessage && <Alert color="success">{modalSuccessMessage}</Alert>}
          </Form>
        </ModalBody>
        <ModalFooter>
          {!modalSuccessMessage && (  // Hide Submit button after success
            <Button color="primary" onClick={handleOtpSubmit}>
              Submit
            </Button>
          )}
          <Button color="secondary" onClick={() => setShowOtpModal(false)}>
            {modalSuccessMessage ? 'Close' : 'Cancel'}  {/* Change Cancel to Close */}
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
