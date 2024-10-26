import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Table, Button, FormGroup, Input, Alert,Form, Modal, ModalBody, ModalFooter, ModalHeader, Label } from "reactstrap";
import axios from "axios";
import DemoNavbar from "components/Navbars/DemoNavbar.js";
import SimpleFooter from "components/Footers/SimpleFooter.js";

import beep1 from "./beep.mp3"; // Import beep sounds
import beep2 from "./beep.mp3"; // Import beep sounds
import beep3 from "./beep.mp3"; // Import beep sounds
import beep4 from "./beep.mp3"; // Import beep sounds
import beep5 from "./beep.mp3"; // Import beep sounds
import beep6 from "./beep.mp3"; // Import beep sounds
import beep7 from "./beep.mp3"; // Import beep sounds
import beep8 from "./beep.mp3"; // Import beep sounds
import beep9 from "./beep.mp3"; // Import beep sounds

const AdminIndex = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [tvFilter, setTvFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);  // Store filtered users
  const [searchTerm, setSearchTerm] = useState("");  // Search term for filtering
  const [expandedOrders, setExpandedOrders] = useState([]); // For expanding previous room numbers
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newTvNumber, setNewTvNumber] = useState('');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [modalSuccessMessage, setModalSuccessMessage] = useState(''); // Success message for the modal

  // State for handling hourly rate change
  const [showRateModal, setShowRateModal] = useState(false);
  const [newHourlyRate, setNewHourlyRate] = useState('');
  const [rateErrorMessage, setRateErrorMessage] = useState('');
  const [rateSuccessMessage, setRateSuccessMessage] = useState(false);  // To hide submit button on success

  // TV Management State
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddTVModal, setShowAddTVModal] = useState(false);
  const [newAddRoomNumber, setNewAddRoomNumber] = useState('');
  const [newAddTvNumber, setNewAddTvNumber] = useState('');
  const [addRoomSuccess, setAddRoomSuccess] = useState('');
  const [addTVSuccess, setAddTVSuccess] = useState('');
  const [addRoomError, setAddRoomError] = useState('');
  const [addTVError, setAddTVError] = useState('');
  const ordersSectionRef = useRef(null);
  const userSectionRef = useRef(null);
  const tvSectionRef = useRef(null);

  // Existing state variables
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedTV, setSelectedTV] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);

  const scrollToOrders = () => {
    ordersSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToManageTV = () => {
    tvSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToUsers = () => {
    userSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin/all-users`, {
          headers: {
            "Content-Type": "application/json",
            'x-auth-token': token,
          },
        });
        setUsers(response.data);
        setFilteredUsers(response.data);  // Set both users and filteredUsers initially
      } catch (err) {
        console.error(err.message);
        setError("Failed to fetch users.");
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    // If search input is empty, show all users
    if (searchValue === "") {
      setFilteredUsers(users); // Reset to full user list
    } else {
      // Otherwise, filter users based on fullName, email, or phoneNumber
      const filtered = users.filter((user) =>
        user.fullName.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue) ||
        (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchValue))
      );
      setFilteredUsers(filtered);
    }
  };

  // Fetch orders and users from the API
  useEffect(() => {
  const fetchOrdersWithUsers = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch all orders with user emails
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin/all-orders`, {
        headers: {
          "Content-Type": "application/json",
          'x-auth-token': token,
        },
      });

      setOrders(response.data); // Set orders data
      setFilteredOrders(response.data);

    } catch (err) {
      console.error(err.message);
      setError("Failed to fetch orders.");
    } finally {
      setUsersLoading(false);
    }
  };

  fetchOrdersWithUsers();
  }, []);

  // Filter orders based on email, room, and TV filters
  useEffect(() => {
    const applyFilters = () => {
      const filtered = orders.filter((order) => {
        const matchEmail = !emailFilter || order.userId.email.includes(emailFilter);
        const matchRoom = !roomFilter || order.roomNumber[0].toString().includes(roomFilter);
        const matchTV = !tvFilter || order.tvNumber[0].toString().includes(tvFilter);
        return matchEmail && matchRoom && matchTV;
      });
      setFilteredOrders(filtered);
    };

    applyFilters();
  }, [emailFilter, roomFilter, tvFilter, orders]);


  // Open modal for changing room/TV number
  const handleChangeRoom = (orderId) => {
    setCurrentOrderId(orderId);
    setNewRoomNumber("");  // Clear new room number input
    setNewTvNumber("");  // Clear new room number input
    setModalErrorMessage("");  // Clear any previous error message
    setModalSuccessMessage("");  // Clear the success message to show the Submit button
    setShowRoomModal(true);
  };

  // Handle changing the room and TV number for an order
  const handleRoomSubmit = async () => {
    if (!newRoomNumber || !newTvNumber) {
      setModalErrorMessage("Please provide both Room and TV numbers");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/admin/change-room`, {
        orderId: currentOrderId,
        newRoomNumber,
        newTvNumber,
      }, {
        headers: {
          'x-auth-token': token,
        },
      });

      const updatedOrder = response.data.order;

      setModalErrorMessage(""); 
      // Success handling
      setModalSuccessMessage("Room number changed successfully!");

      // Update orders state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === currentOrderId ? updatedOrder : order
        )
      );
    } catch (error) {
      setModalErrorMessage("Failed to change room. Please try again.");
    }
  };

  const toggleExpand = (index) => {
    if (expandedOrders.includes(index)) {
      setExpandedOrders(expandedOrders.filter((i) => i !== index)); // Collapse
    } else {
      setExpandedOrders([...expandedOrders, index]); // Expand
    }
  };

  // Open modal for changing hourly rate
  const handleRateChange = () => {
    setNewHourlyRate('');
    setRateErrorMessage('');
    setRateSuccessMessage(false);  // Reset on opening modal
    setShowRateModal(true);
  };

  // Handle submit for hourly rate change
  const handleRateSubmit = async () => {
    if (!newHourlyRate || isNaN(newHourlyRate) || newHourlyRate <= 0) {
      setRateErrorMessage("Please provide a valid hourly rate.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/admin/change-hourly-rate`, {
        newHourlyRate: Number(newHourlyRate),
      }, {
        headers: {
          'x-auth-token': token,
        },
      });

      setRateSuccessMessage(true);  // Show success message
    } catch (error) {
      setRateErrorMessage("Failed to change the hourly rate. Please try again.");
    }
  };


  const handleAddRoom = async () => {
    setAddRoomError('');
    setAddRoomSuccess('');
  
    // Check if the required inputs are provided
    if (!newAddRoomNumber || !newAddTvNumber) {
      setAddRoomError("Room number and initial TV number are required.");
      return;
    }
  
    // Check if the room already exists in the current rooms state
    const roomExists = rooms.some((room) => room.roomNumber === parseInt(newAddRoomNumber, 10));
    if (roomExists) {
      setAddRoomError("Room already exists.");
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/admin/add-room`, {
        roomNumber: newAddRoomNumber,
        tvNumber: newAddTvNumber,
      }, {
        headers: { 'x-auth-token': token }
      });
  
      setAddRoomSuccess("Room with initial TV added successfully");
  
      // Update rooms and filteredRooms with the newly created room
      const newRoom = response.data.room;
      setRooms((prevRooms) => [...prevRooms, newRoom]);
      setFilteredRooms((prevFilteredRooms) => [...prevFilteredRooms, newRoom]);
  
      // Clear inputs after success
      setNewAddRoomNumber('');
      setNewAddTvNumber('');
      setSelectedRoom('');
      setSelectedTV('');
    } catch (error) {
      setAddRoomError("Failed to add room. Please try again.");
    }
  };
  
  const handleAddTV = async () => {
    setAddTVError('');
    setAddTVSuccess('');
  
    // Check if required inputs are provided
    if (!selectedRoom || !newAddTvNumber) {
      setAddTVError("Both Room number and TV number are required.");
      return;
    }
  
    // Check if the room exists in the current rooms state
    const room = rooms.find((room) => room.roomNumber === parseInt(selectedRoom, 10));
    if (!room) {
      setAddTVError("The specified room does not exist.");
      return;
    }
  
    // Check if the TV already exists in the found room
    const tvExists = room.tvs.some((tv) => tv.tvNumber === parseInt(newAddTvNumber, 10));
    if (tvExists) {
      setAddTVError("This TV already exists in the specified room.");
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/admin/add-tv`, {
        roomNumber: selectedRoom,
        tvNumber: newAddTvNumber
      }, {
        headers: { 'x-auth-token': token }
      });
  
      setAddTVSuccess("TV added successfully");
  
      // Update the rooms and filteredRooms state to reflect the added TV
      const updatedRoom = response.data.room;
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.roomNumber === updatedRoom.roomNumber ? updatedRoom : r
        )
      );
      setFilteredRooms((prevFilteredRooms) =>
        prevFilteredRooms.map((r) =>
          r.roomNumber === updatedRoom.roomNumber ? updatedRoom : r
        )
      );
  
      // Clear input fields after success
      setSelectedRoom('');
      setSelectedTV('');
      setNewAddTvNumber('');
    } catch (error) {
      setAddTVError("Failed to add TV. Please try again.");
    }
  };
  

  // Fetch rooms and TVs
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/admin/all-rooms`,
          {
            headers: { "x-auth-token": token },
          }
        );
        setRooms(response.data);
        setFilteredRooms(response.data);
      } catch (err) {
        console.error("Error fetching rooms", err.message);
      }
    };
    fetchRooms();
  }, []);

  // Filter rooms based on input
  const handleRoomFilterChange = (e) => {
    setSelectedRoom(e.target.value);
    filterRooms(e.target.value, selectedTV);
  };

  const handleTVFilterChange = (e) => {
    setSelectedTV(e.target.value);
    filterRooms(selectedRoom, e.target.value);
  };

  const filterRooms = (roomNumber, tvNumber) => {
    const filtered = rooms.filter((room) => {
      const matchRoom =
        !roomNumber || room.roomNumber.toString().includes(roomNumber);
      const matchTV =
        !tvNumber ||
        room.tvs.some((tv) => tv.tvNumber.toString().includes(tvNumber));
      return matchRoom && matchTV;
    });
    setFilteredRooms(filtered);
  };

  // Toggle TV state
  const toggleTVState = async (roomId, tvId, currentState) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/admin/toggle-tv`,
        {
          roomId,
          tvId,
          newState: currentState === "on" ? "off" : "on",
        },
        { headers: { "x-auth-token": token } }
      );

      // Update local state after toggle
      const updatedRooms = rooms.map((room) => {
        if (room._id === roomId) {
          return {
            ...room,
            tvs: room.tvs.map((tv) =>
              tv._id === tvId ? { ...tv, state: response.data.newState } : tv
            ),
          };
        }
        return room;
      });
      setRooms(updatedRooms);
      setFilteredRooms(updatedRooms);
    } catch (error) {
      console.error("Failed to toggle TV state", error.message);
    }
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
      <DemoNavbar/>
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
                    <h2 className="lead text-white">
                      Welcome to the <b>admin panel</b>.
                    </h2>
                    <div className="btn-wrapper mt-5">
                      {/* Manage TVs Button */}
                      <Button
                        className="btn-white btn-icon mb-3 mb-sm-0"
                        color="default"
                        size="lg"
                        onClick={scrollToManageTV}
                      >
                        <span className="btn-inner--icon mr-1">
                          <i className="fa fa-tv" />
                        </span>
                        <span className="btn-inner--text">Manage TVs</span>
                      </Button>

                      {/* View All Orders Button */}
                      <Button
                        className="btn-icon mb-3 mb-sm-0"
                        color="github"
                        size="lg"
                        onClick={scrollToOrders}
                      >
                        <span className="btn-inner--icon mr-1">
                          <i className="fa fa-list" />
                        </span>
                        <span className="btn-inner--text">View All Orders</span>
                      </Button>

                      <Button
                        className="btn-icon mb-3 mb-sm-0 mt-3"
                        color="github"
                        size="lg"
                        onClick={handleRateChange}  // Open rate modal
                      >
                        <span className="btn-inner--icon mr-1">
                          <i className="fa fa-clock-o" />
                        </span>
                        <span className="btn-inner--text">Change Hourly Rate</span>
                      </Button>

                      {/* View All Users Button */}
                      <Button
                        className="btn-white btn-icon mb-3 mb-sm-0 mt-3"
                        color="default"
                        size="lg"
                        onClick={scrollToUsers}
                      >
                        <span className="btn-inner--icon mr-1">
                          <i className="fa fa-users" />
                        </span>
                        <span className="btn-inner--text">View All Users</span>
                      </Button>
                      <Button
                        className="btn-icon mb-3 mb-sm-0 mt-3"
                        color="default"
                        size="lg"
                        onClick={toggleRemoteModal}
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

        {/* Modal for Changing Hourly Rate */}
        <Modal isOpen={showRateModal} toggle={() => setShowRateModal(!showRateModal)}>
          <ModalHeader toggle={() => setShowRateModal(!showRateModal)}>
            Change Hourly Rate
          </ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label for="newHourlyRate">New Hourly Rate</Label>
                <Input
                  type="text"
                  id="newHourlyRate"
                  value={newHourlyRate}
                  onChange={(e) => setNewHourlyRate(e.target.value)}
                  disabled={rateSuccessMessage ? true : false} // Disable input after success
                />
              </FormGroup>
              {rateErrorMessage && <Alert color="danger">{rateErrorMessage}</Alert>}
              {rateSuccessMessage && <Alert color="success">Hourly rate changed successfully!</Alert>}
            </Form>
          </ModalBody>
          <ModalFooter>
            {!rateSuccessMessage && (  // Hide submit on success
              <Button color="primary" onClick={handleRateSubmit}>
                Submit
              </Button>
            )}
            <Button color="secondary" onClick={() => setShowRateModal(false)}>
              {rateSuccessMessage ? 'Close' : 'Cancel'}
            </Button>
          </ModalFooter>
        </Modal>


          {/* All Users Section */}
          <section className="section" ref={userSectionRef}>
          <Container>
            <Row className="justify-content-center">
              <Col lg="8">
                <h3 className="text-center">All Users</h3>

                {/* Search Input */}
                <FormGroup>
                  <Input
                    type="text"
                    placeholder="Search users by name, email, or phone number"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </FormGroup>

                {usersLoading ? (
                  <h6 className="text-center">Loading users...</h6>
                ) : error ? (
                  <Alert color="danger">{error}</Alert>
                ) : (
                  <>
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
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Phone Number</th>
                        </tr>
                      </thead>
                    </Table>
                    <div style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                      <Table
                        responsive
                        className="table-bordered table-opacity"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.60)',
                          borderRadius: '10px',
                        }}
                      >
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user._id}>
                              <td>{user.fullName}</td>
                              <td>{user.email}</td>
                              <td>{user.phoneNumber || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </>
                )}
              </Col>
            </Row>
          </Container>
        </section>

        {/* All Orders Section */}
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
              <Col lg="12">
                <h3 className="text-center">All Orders</h3>

                {/* Filters Row */}
                <Row form className="mb-4">
                  <Col md="4">
                    <FormGroup>
                      <Input
                        type="text"
                        placeholder="Filter by Email"
                        value={emailFilter}
                        onChange={(e) => setEmailFilter(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <Input
                        type="text"
                        placeholder="Filter by Room Number"
                        value={roomFilter}
                        onChange={(e) => setRoomFilter(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <Input
                        type="text"
                        placeholder="Filter by TV Number"
                        value={tvFilter}
                        onChange={(e) => setTvFilter(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                {filteredOrders.length === 0 ? (
                  <h6 className="text-center">No orders found.</h6>
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
                          <th>User Email</th>
                          <th>Time Bought (Hours)</th>
                          <th>Total Cost</th>
                          <th>Room Number</th>
                          <th>TV Number</th>
                          <th>Order Date</th>
                          <th>Change Room</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order, index) => {
                          return (
                            <React.Fragment key={index}>
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
                                <td>{order.userId.email}</td>
                                <td>{order.timeBought}</td>
                                <td>${order.totalCost}</td>
                                <td>{order.roomNumber[0]}</td>
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
                                    <td></td> {/* Empty cell for email */}
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

          {/* Modal for Changing Room (No OTP) */}
          <Modal isOpen={showRoomModal} toggle={() => setShowRoomModal(!showRoomModal)}>
            <ModalHeader toggle={() => setShowRoomModal(!showRoomModal)}>
              Change Room and TV Number
            </ModalHeader>
            <ModalBody>
              <Form>
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
                <Button color="primary" onClick={handleRoomSubmit}>
                  Submit
                </Button>
              )}
              <Button color="secondary" onClick={() => setShowRoomModal(false)}>
                {modalSuccessMessage ? 'Close' : 'Cancel'}
              </Button>
            </ModalFooter>
          </Modal>
        </section>

        {/* Manage TV Section */}
      <section className="section" ref={tvSectionRef}>
        <Container>
      <Row className="justify-content-center">
        <Col lg="8">
          <h3 className="text-center">Manage TVs</h3>

          <div className="text-center mt-4">
            <Button color="primary" onClick={() => { setShowAddRoomModal(true); setAddRoomError(''); setAddRoomSuccess(''); }}>
              Add Room
            </Button>
            <Button color="primary" className="ml-3" onClick={() => { setShowAddTVModal(true); setAddTVError(''); setAddTVSuccess(''); }}>
              Add TV
            </Button>
          </div>
          
          {/* Input fields for filtering */}
          <FormGroup className="mt-4">
            <Row>
              <Col md="6">
                <Input
                  type="text"
                  placeholder="Enter Room Number"
                  value={selectedRoom}
                  onChange={handleRoomFilterChange}
                />
              </Col>
              <Col md="6">
                <Input
                  type="text"
                  placeholder="Enter TV Number"
                  value={selectedTV}
                  onChange={handleTVFilterChange}
                />
              </Col>
            </Row>
          </FormGroup>

          {/* Scrollable Table for Rooms and TVs */}
          <div style={{ maxHeight: "400px", overflowY: "scroll", marginTop: "20px" }}>
            <Table bordered responsive>
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>TV Number</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) =>
                  room.tvs.map((tv) => (
                    <tr key={tv._id}>
                      <td>{room.roomNumber}</td>
                      <td>{tv.tvNumber}</td>
                      <td>
                        <Button
                          color={tv.state === "on" ? "success" : "secondary"}
                          onClick={() =>
                            toggleTVState(room._id, tv._id, tv.state)
                          }
                        >
                          {tv.state === "on" ? "ON" : "OFF"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </Container>
      </section>

      {/* Modal for Adding Room */}
      <Modal isOpen={showAddRoomModal} toggle={() => setShowAddRoomModal(false)}>
        <ModalHeader toggle={() => setShowAddRoomModal(false)}>Add Room</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="newRoomNumber">Room Number</Label>
            <Input
              type="number"
              id="newRoomNumber"
              value={newAddRoomNumber}
              onChange={(e) => setNewAddRoomNumber(e.target.value)}
              min="0"
              disabled={addRoomSuccess ? true : false} // Disable input after success
            />
          </FormGroup>
          <FormGroup>
            <Label for="newTvNumber">Initial TV Number</Label>
            <Input
              type="number"
              id="newTvNumber"
              value={newAddTvNumber}
              onChange={(e) => setNewAddTvNumber(e.target.value)}
              min="0"              
              disabled={addRoomSuccess ? true : false} // Disable input after success
            />
          </FormGroup>
          {addRoomError && <Alert color="danger">{addRoomError}</Alert>}
          {addRoomSuccess && <Alert color="success">{addRoomSuccess}</Alert>}
          <Alert color="info">
            A room cannot be created without an initial TV. Once the room is created,
            you can add as many TVs as you want using the Add TV button.
          </Alert>
        </ModalBody>
        <ModalFooter>
          {!addRoomSuccess && (
            <Button color="primary" onClick={handleAddRoom}>
              Submit
            </Button>
          )}
          <Button color="secondary" onClick={() => setShowAddRoomModal(false)}>
            {addRoomSuccess ? "Close" : "Cancel"}
          </Button>
        </ModalFooter>
      </Modal>


      {/* Modal for Adding TV */}
      <Modal isOpen={showAddTVModal} toggle={() => setShowAddTVModal(false)}>
        <ModalHeader toggle={() => setShowAddTVModal(false)}>Add TV</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="roomNumber">Room Number</Label>
            <Input
              type="number"
              id="roomNumber"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              min="0"
              disabled={addTVSuccess ? true : false} // Disable input after success
            />
          </FormGroup>
          <FormGroup>
            <Label for="tvNumber">TV Number</Label>
            <Input
              type="number"
              id="tvNumber"
              value={newAddTvNumber}
              onChange={(e) => setNewAddTvNumber(e.target.value)}
              min="0"
              disabled={addTVSuccess ? true : false} // Disable input after success
            />
          </FormGroup>
          {addTVError && <Alert color="danger">{addTVError}</Alert>}
          {addTVSuccess && <Alert color="success">{addTVSuccess}</Alert>}
        </ModalBody>
        <ModalFooter>
          {!addTVSuccess && (
            <Button color="primary" onClick={handleAddTV}>
              Submit
            </Button>
          )}
          <Button color="secondary" onClick={() => setShowAddTVModal(false)}>
            {addTVSuccess ? "Close" : "Cancel"}
          </Button>
        </ModalFooter>
      </Modal>

        </main>
      <SimpleFooter />
    </>
  );
};

export default AdminIndex;
