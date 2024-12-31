import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Table, Button, FormGroup, Input, Alert,Form, Modal, ModalBody, ModalFooter, ModalHeader, Label } from "reactstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DemoNavbar from "../Navbars/DemoNavbar.js";
import SimpleFooter from "../Footers/SimpleFooter.js";
import { useTranslation } from "react-i18next";

const AdminIndex = () => {

  const { t } = useTranslation(); // Initialize useTranslation
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [tvFilter, setTvFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);  // Store filtered users
  const [searchTerm, setSearchTerm] = useState("");  // Search term for filtering
  const [expandedOrders, setExpandedOrders] = useState([]); // For expanding previous room numbers
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [newTvNumber, setNewTvNumber] = useState('');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [modalSuccessMessage, setModalSuccessMessage] = useState(''); // Success message for the modal

  // State for handling hourly rate change
  const [showRateModal, setShowRateModal] = useState(false);
  const [newHourlyRate, setNewHourlyRate] = useState('');
  const [thresholds, setThresholds] = useState([]);
  const [rateErrorMessage, setRateErrorMessage] = useState('');
  const [rateSuccessMessage, setRateSuccessMessage] = useState(false);  // To hide submit button on success

  // TV Management State
  const [showAddTVModal, setShowAddTVModal] = useState(false);
  const [newAddTvNumber, setNewAddTvNumber] = useState('');
  const [addTVSuccess, setAddTVSuccess] = useState('');
  const [addTVError, setAddTVError] = useState('');
  const ordersSectionRef = useRef(null);
  const userSectionRef = useRef(null);
  const tvSectionRef = useRef(null);

  // Existing state variables
  const [tvs, setTVs] = useState([]);
  const [selectedTV, setSelectedTV] = useState("");
  const [filteredTVs, setFilteredTVs] = useState([]);

  const navigate = useNavigate(); // Define navigate

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
      setError(t("fetchOrdersError")); // Use the translation key
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
        const matchTV = !tvFilter || order.tvNumber[0].toString().includes(tvFilter);
        return matchEmail && matchTV;
      });
      setFilteredOrders(filtered);
    };

    applyFilters();
  }, [emailFilter, tvFilter, orders]);


  // Open modal for changing room/TV number
  const handleChangeRoom = (orderId) => {
    setCurrentOrderId(orderId);
    setNewTvNumber("");  // Clear new room number input
    setModalErrorMessage("");  // Clear any previous error message
    setModalSuccessMessage("");  // Clear the success message to show the Submit button
    setShowRoomModal(true);
  };

  // Handle changing the room and TV number for an order
  const handleRoomSubmit = async () => {
    if (!newTvNumber) {
      setModalErrorMessage(t("provideTvNumberError"));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/admin/change-room`, {
        orderId: currentOrderId,
        newTvNumber,
      }, {
        headers: {
          'x-auth-token': token,
        },
      });

      const updatedOrder = response.data.order;

      setModalErrorMessage(""); 
      // Success handling
      setModalSuccessMessage(t("tvChangeSuccess"));
      
      // Update orders state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === currentOrderId ? updatedOrder : order
        )
      );
    } catch (error) {
      setModalErrorMessage(t("tvChangeError")); // Use the translation key    
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

  // Fetch thresholds from backend when modal opens
  useEffect(() => {
    const fetchThresholds = async () => {
      setRateErrorMessage('');
      setRateSuccessMessage(false);

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/rates/rate`, {
          headers: { 'x-auth-token': token },
        });
        setThresholds(response.data.thresholds); // Set thresholds from backend
      } catch (error) {
        setRateErrorMessage('Failed to load thresholds.');
      } finally {
      }
    };

    if (showRateModal) {
      fetchThresholds(); // Fetch data when modal opens
    }
  }, [showRateModal]);

  // Add new threshold
  const addThreshold = () => {
    setThresholds([...thresholds, { days: '', price: '' }]);
  };

  // Remove threshold
  const removeThreshold = (index) => {
    const updated = thresholds.filter((_, i) => i !== index);
    setThresholds(updated);
  };

  // Handle input changes
  const handleInputChange = (index, field, value) => {
    const updated = thresholds.map((t, i) =>
      i === index ? { ...t, [field]: value } : t
    );
    setThresholds(updated);
  };

  // Submit updated thresholds
  const handleThresholdSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/admin/change-thresholds`, 
        { thresholds },
        { headers: { 'x-auth-token': token } }
      );
      setRateSuccessMessage(true);
    } catch (error) {
      setRateErrorMessage("Failed to update thresholds.");
    }
  };


  // Handle submit for hourly rate change
  const handleRateSubmit = async () => {
    if (!newHourlyRate || isNaN(newHourlyRate) || newHourlyRate <= 0) {
      setRateErrorMessage(t("validHourlyRateError")); // Use the translation key
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
      setRateErrorMessage(t("hourlyRateChangeError")); // Use the translation key
    }
  };

  
  const handleAddTV = async () => {
    setAddTVError('');
    setAddTVSuccess('');
  
    // Validate TV number input
    if (!newAddTvNumber) {
      setAddTVError(t("tvNumberRequiredError")); // Use the translation key
      return;
    }
  
    if (newAddTvNumber.length !== 4) {
      setAddTVError("TV number must be exactly 4 digits.");
      return;
    }
  
    // Check if the TV number already exists in the local state (optional optimization before API call)
    const tvExists = tvs.some((tv) => tv.tvNumber === parseInt(newAddTvNumber, 10));
    if (tvExists) {
      setAddTVError(t("tvExistsError")); // Use the translation key
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/admin/add-tv`, {
        tvNumber: newAddTvNumber,
      }, {
        headers: { 'x-auth-token': token },
      });
  
      const { msg, tv } = response.data;
  
      setAddTVSuccess(msg); // Show success message from the server response
  
      // Update the TVs state to reflect the added TV
      setTVs((prevTVs) => [...prevTVs, tv]);
      setFilteredTVs((prevFilteredTVs) => [...prevFilteredTVs, tv]);
  
      // Clear input fields after success
      setNewAddTvNumber('');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.msg) {
        // Handle specific error messages from the server
        setAddTVError(error.response.data.msg);
      } else {
        setAddTVError(t("addTvError")); // Use the translation key
      }
    }
  };
  
  
  

  // Fetch TVs
  useEffect(() => {
    const fetchTVs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/admin/all-tvs`,
          {
            headers: { "x-auth-token": token },
          }
        );

        if (response.data.length === 0) {
          // Handle case where no TVs are found
          console.warn("No TVs found");
          setTVs([]);
          setFilteredTVs([]);
        } else {
          // Update state with fetched TVs
          setTVs(response.data);
          setFilteredTVs(response.data);
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // Handle 404 (No TVs found)
          console.warn(err.response.data.msg || "No TVs found");
          setTVs([]);
          setFilteredTVs([]);
        } else {
          // Handle other errors
          console.error("Error fetching TVs:", err.message || err.response.data);
        }
      }
    };

    fetchTVs();
  }, []);



  const handleTVFilterChange = (e) => {
    const inputValue = e.target.value;
    setSelectedTV(inputValue);
    filterTVs(inputValue);
  };

  const filterTVs = (tvNumber) => {
    const filtered = tvs.filter((tv) =>
      !tvNumber || tv.tvNumber.includes(tvNumber)
    );
    setFilteredTVs(filtered);
  };
  

  // Toggle TV state
const toggleTVState = async (tvNumber, currentState) => {
  try {
    const token = localStorage.getItem("token");
    console.log(tvNumber)
    const response = await axios.put(
      `${process.env.REACT_APP_BASE_URL}/api/admin/toggle-tv`,
      {
        tvNumber,
        newState: currentState === "on" ? "off" : "on",
      },
      { headers: { "x-auth-token": token } }
    );

    // Update local state after toggle
    const updatedTVs = tvs.map((tv) =>
      tv.tvNumber === tvNumber ? { ...tv, state: response.data.newState } : tv
    );

    const updatedFilteredTVs = filteredTVs.map((tv) =>
      tv.tvNumber === tvNumber ? { ...tv, state: response.data.newState } : tv
    );

    setTVs(updatedTVs);
    setFilteredTVs(updatedFilteredTVs);
  } catch (error) {
    console.error("Failed to toggle TV state", error.message);
  }
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
                      src={require("../../assets/img/brand/argon-react-white.png")}
                      style={{ width: "200px" }}
                    />
                    <h2 className="lead text-white">
                      {t("welcomeAdminPanel")}
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
                        <span className="btn-inner--text">{t("manageTvs")}</span>
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
                        <span className="btn-inner--text">{t("viewAllOrders")}</span>
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
                        <span className="btn-inner--text">{t("changeHourlyRate")}</span>
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
                        <span className="btn-inner--text">{t("viewAllUsers")}</span>
                      </Button>
                      <Button
                        className="btn-icon mb-3 mb-sm-0 mt-3"
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


        {/* Modal for Changing Hourly Rate
        <Modal isOpen={showRateModal} toggle={() => setShowRateModal(!showRateModal)}>
          <ModalHeader toggle={() => setShowRateModal(!showRateModal)}>
          {t("changeHourlyRate")}
          </ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
              <Label for="newHourlyRate">{t("newHourlyRate")}</Label>
                <Input
                  type="text"
                  id="newHourlyRate"
                  value={newHourlyRate}
                  onChange={(e) => setNewHourlyRate(e.target.value)}
                  disabled={rateSuccessMessage ? true : false} // Disable input after success
                />
              </FormGroup>
              {rateErrorMessage && <Alert color="danger">{rateErrorMessage}</Alert>}
              {rateSuccessMessage && <Alert color="success">{t("hourlyRateChangeSuccess")}</Alert>}
            </Form>
          </ModalBody>
          <ModalFooter>
            {!rateSuccessMessage && (  // Hide submit on success
              <Button color="primary" onClick={handleRateSubmit}>
                {t("submit")}
              </Button>
            )}
            <Button color="secondary" onClick={() => setShowRateModal(false)}>
            {rateSuccessMessage ? t("close") : t("cancel")} 
            </Button>
          </ModalFooter>
        </Modal> */}

          <Modal isOpen={showRateModal} toggle={() => setShowRateModal(!showRateModal)}>
            <ModalHeader toggle={() => setShowRateModal(!showRateModal)}>
              {t("changeHourlyRate")}
            </ModalHeader>
            <ModalBody>
              <Table>
                <thead>
                  <tr>
                    <th>{t("days")}</th>
                    <th>{t("price")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {thresholds.map((threshold, index) => (
                    <tr key={index}>
                      <td>
                        <Input
                          type="number"
                          value={threshold.days}
                          min={0}
                          onChange={(e) => handleInputChange(index, 'days', e.target.value)}
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          min={0}
                          value={threshold.price}
                          onChange={(e) => handleInputChange(index, 'price', e.target.value)}
                        />
                      </td>
                      <td>
                        <Button color="danger" onClick={() => removeThreshold(index)}>
                          {t("remove")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button color="primary" onClick={addThreshold} disabled={rateSuccessMessage} className="mb-3" // Add margin-bottom of 3 units
              >
                {t("addThreshold")}
              </Button>
              {rateErrorMessage && <Alert mt-2 color="danger">{rateErrorMessage}</Alert>}
              {rateSuccessMessage && <Alert mt-2 color="success">{t("hourlyRateChangeSuccess")}</Alert>}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={handleThresholdSubmit} disabled={rateSuccessMessage}>
                {t("submit")}
              </Button>
              <Button color="secondary" onClick={() => setShowRateModal(false)}>
                {t("close")}
              </Button>
            </ModalFooter>
          </Modal>


          {/* All Users Section */}
          <section className="section" ref={userSectionRef}>
          <Container>
            <Row className="justify-content-center">
              <Col lg="8">
              <h3 className="text-center">{t("allUsers")}</h3>
                {/* Search Input */}
                <FormGroup>
                  <Input
                    type="text"
                    placeholder={t("searchUsersPlaceholder")}
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </FormGroup>

                {usersLoading ? (
                  <h6 className="text-center">{t("loadingUsers")}</h6>
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
                        <th>{t("fullName")}</th>
                        <th>{t("email")}</th>
                        <th>{t("phoneNumber")}</th> 
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
              <h3 className="text-center">{t("allOrders")}</h3>
                {/* Filters Row */}
                <Row form className="mb-4">
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="text"
                        placeholder={t("filterByEmailPlaceholder")}
                        value={emailFilter}
                        onChange={(e) => setEmailFilter(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="text"
                        placeholder={t("filterByTvNumberPlaceholder")} 
                        value={tvFilter}
                        onChange={(e) => setTvFilter(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                {filteredOrders.length === 0 ? (
                  <h6 className="text-center">{t("noOrdersFound")}</h6>
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
                        <th>{t("expandPreviousTv")}</th>
                        <th>{t("userEmail")}</th>
                        <th>{t("timeBought")}</th>
                        <th>{t("totalCost")}</th>
                        <th>{t("tvNumber")}</th>
                        <th>{t("orderDate")}</th>
                        <th>{t("changeTv")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order, index) => {
                          return (
                            <React.Fragment key={index}>
                              <tr>
                                <td>
                                  {order.tvNumber.length > 1 && (
                                    <Button
                                      className="btn-icon mb-3 mb-sm-0"
                                      color="primary"
                                      size="sm"
                                      onClick={() => toggleExpand(index)}
                                      style={{ padding: '0 10px', marginLeft: '25px', marginTop: '10px' }}
                                    >
                                      <span className="btn-inner--icon m-2">
                                        <i className={expandedOrders.includes(index) ? 'fa fa-chevron-up' : 'fa fa-chevron-down'} />
                                      </span>
                                    </Button>
                                  )}
                                </td>
                                <td>{order.userId.email}</td>
                                <td>{order.timeBought}</td>
                                <td>${order.totalCost}</td>
                                <td>{order.tvNumber[0]}</td>
                                <td>{formatDate(order.orderDate)}</td>
                                <td>
                                  <Button color="primary" onClick={() => handleChangeRoom(order._id)}>
                                  {t("changeTv")}
                                  </Button>
                                </td>
                              </tr>

                              {/* Conditionally show previous TV numbers */}
                              {expandedOrders.includes(index) &&
                                order.tvNumber.slice(1).map((tv, i) => (
                                  <tr key={`${index}-${i}`} className="previous-entries">
                                    <td></td>
                                    <td></td> {/* Empty cell for email */}
                                    <td></td> {/* Empty cell for Time Bought */}
                                    <td></td> {/* Empty cell for Total Cost */}
                                    <td>{tv}</td>
                                    <td></td> {/* Empty cell for Order Date */}
                                    <td>
                                      {t("previousTV")}
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


          {/* Modal for Changing TV (No OTP) */}
          <Modal isOpen={showRoomModal} toggle={() => setShowRoomModal(!showRoomModal)}>
            <ModalHeader toggle={() => setShowRoomModal(!showRoomModal)}>
            {t("changeTvNumber")}
            </ModalHeader>
            <ModalBody>
              <Form>
                <FormGroup>
                <Label for="newTvNumber">{t("newTvNumber")}</Label> 
                  <Input
                    type="text"
                    id="newTvNumber"
                    value={newTvNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,4}$/.test(value)) { // Allows only up to 4 digits
                        setNewTvNumber(value);
                      }
                    }}                    
                    placeholder={t("enter4DigitNum")}
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
                  onClick={handleRoomSubmit}
                  disabled={newTvNumber.length !== 4} // Enable only if TV number length is 4
                >
                  {t("submit")}
                </Button>
              )}
              <Button color="secondary" onClick={() => setShowRoomModal(false)}>
              {modalSuccessMessage ? t("close") : t("cancel")} 
              </Button>
            </ModalFooter>
          </Modal>

        </section>


        {/* Manage TV Section */}
        <section className="section" ref={tvSectionRef}>
          <Container>
            <Row className="justify-content-center">
              <Col lg="8">
              <h3 className="text-center">{t("manageTvs")}</h3>
                <div className="text-center mt-4">
                  <Button
                    color="primary"
                    onClick={() => {
                      setShowAddTVModal(true);
                      setAddTVError('');
                      setAddTVSuccess('');
                    }}
                  >{t("addTv")}
                  </Button>
                </div>

                {/* Input field for filtering */}
                <FormGroup className="mt-4">
                  <Input
                    type="text"
                    placeholder={t("enterTvNumberPlaceholder")}
                    value={selectedTV}
                    onChange={handleTVFilterChange}
                  />
                </FormGroup>

                {/* Scrollable Table for TVs */}
                <div style={{ maxHeight: "400px", overflowY: "scroll", marginTop: "20px" }}>
                  <Table bordered responsive>
                    <thead>
                      <tr>
                      <th>{t("tvNumber")}</th>
                      <th>{t("state")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTVs.map((tv) => (
                        <tr key={tv._id}>
                          <td>{tv.tvNumber}</td>
                          <td>
                            <Button
                              color={tv.state === "on" ? "success" : "secondary"}
                              onClick={() => toggleTVState(tv.tvNumber, tv.state)}
                            >
                              {tv.state === "on" ? "ON" : "OFF"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Col>
            </Row>
          </Container>
        </section>


      {/* Modal for Adding TV */}
      <Modal isOpen={showAddTVModal} toggle={() => setShowAddTVModal(false)}>
        <ModalHeader toggle={() => setShowAddTVModal(false)}>Add TV</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="tvNumber">{t("tvNumber")}</Label>
            <Input
              type="text"
              id="tvNumber"
              value={newAddTvNumber}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,4}$/.test(value)) { // Allows only up to 4 digits
                  setNewAddTvNumber(value);
                }
              }}                 
              disabled={addTVSuccess ? true : false} // Disable input after success
              placeholder={t("enter4DigitNum")}
            />
          </FormGroup>
          {addTVError && <Alert color="danger">{addTVError}</Alert>}
          {addTVSuccess && <Alert color="success">{addTVSuccess}</Alert>}
        </ModalBody>
        <ModalFooter>
          {!addTVSuccess && (
            <Button
              color="primary"
              onClick={handleAddTV}
              disabled={newAddTvNumber.length !== 4} // Enable only if TV number is 4 digits
            >
              {t("submit")}
            </Button>
          )}
          <Button color="secondary" onClick={() => setShowAddTVModal(false)}>
            {addTVSuccess ? t("close") : t("cancel")}
          </Button>
        </ModalFooter>
      </Modal>

        </main>
      <SimpleFooter />
    </>
  );
};

export default AdminIndex;
