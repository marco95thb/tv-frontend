import React, { useState, useEffect, useRef } from "react";
import { Spinner, Container, Row, Col, Table, Button, FormGroup, Input, Alert,Form, Modal, ModalBody, ModalFooter, ModalHeader, Label } from "reactstrap";
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
  const [loading, setLoading] = useState(false);

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
  const [deviceWarning, setDeviceWarning] = useState('');
  const [loadingTV, setLoadingTV] = useState(null); // Track which TV is loading

  const [newTTL, setNewTTL] = useState('');
  const [showTTLModal, setShowTTLModal] = useState(false);

  const [groupNumber, setGroupNumber] = useState('');
  const [minutes, setMinutes] = useState('');
  const [showActivateAllModal, setShowActivateAllModal] = useState(false);

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

  const handleRoomSubmit = async () => {
    if (!newTvNumber) {
      setModalErrorMessage(t("provideTvNumberError"));
      return;
    }

    setLoading(true); // Start loading
    setModalErrorMessage(""); // Clear errors
    setModalSuccessMessage(""); // Clear success messages

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/admin/change-room`,
        {
          orderId: currentOrderId,
          newTvNumber,
        },
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );

      const result = response.data;

      if (result.success) {
        // Success handling
        setModalSuccessMessage(t("tvChangeSuccess"));
        setModalErrorMessage(""); // Clear errors

        const updatedOrder = result.order;

        // Update orders state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === currentOrderId ? updatedOrder : order
          )
        );
      } else {
        // Handle failure due to device connection
        setModalErrorMessage(
          result.message || "Device not connected. Ensure the device is up and connected to server."
        );
      }
    } catch (error) {
      console.error("Failed to change room:", error.message);

      // Error handling
      setModalErrorMessage(
        error.response && error.response.data
          ? error.response.data.message
          : t("tvChangeError")
      );
    } finally {
      setLoading(false); // End loading
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
    // Reset previous errors and success messages
    setAddTVError('');
    setAddTVSuccess('');
    setLoading(true);
  
    // Validate TV number input
    if (!newAddTvNumber) {
      setAddTVError(t("tvNumberRequiredError")); // Use translation key
      setLoading(false);
      return;
    }
  
    if (newAddTvNumber.length !== 4 || !/^[0-9]{4}$/.test(newAddTvNumber)) {
      setAddTVError(t("invalidTvNumberError")); // Use translation key for invalid format
      setLoading(false);
      return;
    }
  
    // Check if the TV number already exists in the local state
    const tvExists = tvs.some((tv) => tv.tvNumber === newAddTvNumber);
    if (tvExists) {
      setAddTVError(t("tvExistsError")); // Use translation key
      setLoading(false);
      return;
    }
  
    try {
      // API call to add TV
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/admin/add-tv`,
        {
          tvNumber: newAddTvNumber,
        },
        {
          headers: { 'x-auth-token': token },
        }
      );
  
      const result = response.data;
  
      if (result.success) {
        // Success: Show message and update TV list
        setAddTVSuccess(result.message); // Display success message
        setDeviceWarning(''); // Clear warnings if any
  
        // Update local state with new TV
        setTVs((prevTVs) => [...prevTVs, result.tv]);
        setFilteredTVs((prevFilteredTVs) => [...prevFilteredTVs, result.tv]);
  
        // Clear input field after success
        setNewAddTvNumber('');
        setLoading(false);
      } else {
        // Failure: Show warning message
        setDeviceWarning(
          "Device not connected. Data might be outdated. You cannot perform any operation. Kindly make sure device is up and connected to server."
        );
        setAddTVError(result.message || t("addTvFailed"));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error adding TV:', error);
  
      // Handle errors from the server or network
      if (error.response && error.response.data && error.response.data.message) {
        setAddTVError(error.response.data.message); // Show server-specific error message
      } else {
        setAddTVError(t("addTvError")); // Use generic error message
      }
  
      // Set warning in case of failure
      setDeviceWarning(
        "Device not connected. Data might be outdated. You cannot perform any operation. Kindly make sure device is up and connected to server."
      );
      setLoading(false);
    }
  };
  
  

  // Fetch TVs and establish WebSocket connection
  useEffect(() => {
    let socket; // Declare socket outside to maintain reference

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
          console.warn(err.response.data.msg || "No TVs found");
          setTVs([]);
          setFilteredTVs([]);
        } else {
          console.error("Error fetching TVs:", err.message || err.response.data);
        }
      }
    };

    const connectWebSocket = () => {
      // Establish WebSocket connection
      socket = new WebSocket(`${process.env.REACT_APP_SERVER_SOCKET}`);

      socket.onopen = () => {
        console.log("WebSocket connected");
      };

      socket.onmessage = (event) => {
        try {
          const receivedData = JSON.parse(event.data);
  
          // Check if the received message is device connection status
          if (receivedData.type === "device-status") {
            if (!receivedData.isDeviceConnected) {
              // If device is not connected, show warning
              setDeviceWarning(
                t("deviceNotConnected")
              );
            } else {
              // If device is connected, clear the warning
              setDeviceWarning("");
            }
          }
          // If the data is an array (TV information), normalize and process
          else if (Array.isArray(receivedData)) {
            setTVs(receivedData);
            setFilteredTVs(receivedData);
            setDeviceWarning(""); // Clear warning if data is received
            setSelectedTV("");
          } else {
            console.warn("Invalid data format received:", receivedData);
          }
        } catch (err) {
          console.error("Error processing WebSocket message:", err.message);
        }
      };
  

      socket.onclose = () => {
        console.warn("WebSocket disconnected. Reconnecting...");
        // Attempt to reconnect after 5 seconds if disconnected
        setTimeout(connectWebSocket, 5000);
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    // Fetch TVs and then establish WebSocket connection
    fetchTVs().then(() => connectWebSocket());

    // Cleanup WebSocket connection on component unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
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
  

  const toggleTVState = async (tvNumber, currentState) => {
    try {
      setLoadingTV(tvNumber); // Set loading state for this TV
      const token = localStorage.getItem("token");
  
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/admin/toggle-tv`,
        {
          tvNumber,
          newState: currentState === "on" ? "off" : "on", // Toggle state
        },
        { headers: { "x-auth-token": token } }
      );
  
      const result = response.data;
  
      if (result.success) {
        // Success - Update state locally
        const updatedTVs = tvs.map((tv) =>
          tv.tvNumber === tvNumber ? { ...tv, state: result.newState } : tv
        );
        const updatedFilteredTVs = filteredTVs.map((tv) =>
          tv.tvNumber === tvNumber ? { ...tv, state: result.newState } : tv
        );
  
        setTVs(updatedTVs);
        setFilteredTVs(updatedFilteredTVs);
        setDeviceWarning(""); // Clear warnings
      } else {
        // Failure Handling Based on Error Message
        if (result.message.includes("Device not connected")) {
          // Device is offline - Show warning and disable operations
          setDeviceWarning(
            "Failed to update state. Device not connected. You cannot perform any operations until the device sends updated data. Kindly make sure the device is up and connected to the server."
          );
        } else if (result.message.includes("failed to confirm")) {
          // Device rejected the toggle - Show error without disabling operations
          alert("The device rejected the state change. Please try again.");
        } else if (result.message.includes("confirmation timeout")) {
          // Device timeout - Show alert without triggering deviceWarning
          alert("The device did not respond in time. Please try again.");
        } else if (result.message.includes("Device refused to change the state")) {
          // Device explicitly refused - Show alert without setting deviceWarning
          alert("The device refused to change the state. Please try again.");
        } else {
          // Generic error handling
          alert(result.message || "An unknown error occurred.");
        }
      }
    } catch (error) {
      console.error("Failed to toggle TV state:", error.message);
  
      // Handle timeout errors explicitly
      if (error.response && error.response.status === 408) {
        alert("The device did not respond in time. Please try again.");
      } else {
        // Generic server error
        setDeviceWarning("Something went wrong on the server side.");
        alert("Failed to toggle TV state.");
      }
    } finally {
      setLoadingTV(null); // Clear loading state
    }
  };
  
   

  // Handles bonus input change
  const handleBonusChange = (tvNumber, value) => {
    const updatedTVs = filteredTVs.map((tv) => 
      tv.tvNumber === tvNumber ? { ...tv, newBonus: value } : tv
    );
    setFilteredTVs(updatedTVs);
  };

  // Handles set time input change
  const handleSetTimeChange = (tvNumber, value) => {
    const updatedTVs = filteredTVs.map((tv) => 
      tv.tvNumber === tvNumber ? { ...tv, newSetTime: value } : tv
    );
    setFilteredTVs(updatedTVs);
  };

  // Handles sending configuration to the backend
  const handleSendConfiguration = async (tvNumber) => {
    const tv = filteredTVs.find((t) => t.tvNumber === tvNumber);

    // Prepare configuration payload
    const config = {
      tv_number: tvNumber,
      force: parseInt(tv.state === "on" ? 1 : 0),
      bonus: parseFloat((tv.newBonus * 100) || 0),
      set_time: parseInt(tv.newSetTime || 0),
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/admin/send-configuration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token, // Add authentication token
        },
        body: JSON.stringify(config),
      });

      const result = await response.json(); // Parse JSON response

      if (result.success) {
        alert(t("configSuccess")); // Configuration sent successfully
        setDeviceWarning(""); // Clear any previous warnings
      } else {
        // Handle failure and set warning
        setDeviceWarning(
          t("failedToSendConfig")
        );
      }
    } catch (error) {
      console.error('Error sending configuration:', error);
      alert("Failed to send configuration");
      setDeviceWarning(
        t("failedToSendConfig")
      );
    }
  };

  const deleteTV = async (tvNumber) => {
    try {
      // Check if TV exists locally before making API call
      const tvExists = tvs.some((tv) => tv.tvNumber === tvNumber);
      if (!tvExists) {
        alert(t("tvDoesNotExist")); // Raise alert if TV does not exist
        return;
      }

      setLoading(true);
  
      // API call to delete TV
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/admin/remove-tv`,
        {
          data: { tvNumber },
          headers: { 'x-auth-token': token },
        }
      );
  
      const result = response.data;
  
      if (result.success) {
        // Success: Show message and update TV list
        alert(t("tvDeleted")); // Configuration sent successfully
        setDeviceWarning(""); // Clear any previous warnings
  
        // Update local state by removing the deleted TV
        setTVs((prevTVs) => prevTVs.filter((tv) => tv.tvNumber !== tvNumber));
        setFilteredTVs((prevFilteredTVs) => prevFilteredTVs.filter((tv) => tv.tvNumber !== tvNumber));
        setLoading(false);
      } else {
        // Handle failure and set warning
        setDeviceWarning(
          t("deleteFailure")
        );
        setLoading(false);
      }
    } catch (error) {
      console.error('Error deleting TV:', error);
      console.error('Error sending configuration:', error);
      alert("Failed to delete tv");
      setDeviceWarning(
        t("deleteFailure")
      );
  
      setLoading(false);
    }
  };
  

  // Handles activating all TVs
  const handleActivateAll = async () => {
    // Calculate the total sum of remaining minutes
    const totalRemainingMinutes = tvs.reduce((sum, tv) => sum + (tv.remainingDuration || 0), 0);

    const config = {
      sum_of_minutes: totalRemainingMinutes,
      group_number: groupNumber,
      minutes: minutes,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/admin/activate-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token, // Add authentication token
        },
        body: JSON.stringify(config),
      });

      const result = await response.json(); // Parse JSON response

      if (result.success) {
        alert(t("activateAllSuccess")); // Success alert
        setDeviceWarning(""); // Clear warnings if successful
      } else {
        // Handle failure and set warning
        setDeviceWarning(
          t("failedToSendConfig")
        );
      }
    } catch (error) {
      console.error('Error activating all TVs:', error);
      alert(t("activateAllError"));
      setDeviceWarning(
        t("failedToSendConfig")
      );
    }
  };

  // Open modal for changing hourly rate
  const handleTTLChange = () => {
    setNewTTL('');
    setModalErrorMessage('');
    setModalSuccessMessage('');
    setShowTTLModal(true);
  };

  const handleTTLSubmit = async () => {
    if (!newTTL || newTTL <= 0) {
      setModalErrorMessage('Please provide a valid TTL in months.');
      return;
    }

    setLoading(true);
    setModalErrorMessage('');
    setModalSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/admin/set-time-to-live`,
        { ttlInMonths: newTTL },
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );

      const result = response.data;

      if (response.status === 200) {
        setModalSuccessMessage(`TTL successfully set to ${newTTL} month(s).`);
      } else {
        setModalErrorMessage(result.message || 'Failed to set TTL. Please try again.');
      }
    } catch (error) {
      console.error('Failed to set TTL:', error.message);
      setModalErrorMessage(
        error.response && error.response.data
          ? error.response.data.message
          : 'An error occurred while setting TTL.'
      );
    } finally {
      setLoading(false);
    }
  };

  const exportDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const exportToCSV = () => {
    const headers = [
      t("userEmail"),
      t("timeBought"),
      t("totalCost"),
      t("tvNumber"),
      t("orderDate")
    ];

    const formatTVNumbers = (tvNumbers) => {
      return `[${tvNumbers.join('-')}]`;
    };

    const rows = orders.map(order => [
      order.userId.email,
      order.timeBought,
      `${order.totalCost}`,
      formatTVNumbers(order.tvNumber),
      exportDate(order.orderDate)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "orders.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleActivateSubmit = async () => {
    if (!groupNumber || !minutes) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    await handleActivateAll(groupNumber, minutes);
    setLoading(false);
    setShowActivateAllModal(false);
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
                        onClick={handleTTLChange}  // Open TTL modal
                      >
                        <span className="btn-inner--icon mr-1">
                          <i className="fa fa-clock-o" />
                        </span>
                        <span className="btn-inner--text">{t("setTTL")}</span>
                      </Button>

                      {/* <Button
                        className="btn-icon mb-3 mb-sm-0 mt-3"
                        color="default"
                        size="lg"
                        onClick={() => navigate("/remote")} // Navigate to /remote on click
                        >
                        <span className="btn-inner--icon mr-1">
                          <i className="fa fa-tv" />
                        </span>
                        <span className="btn-inner--text">{t("remote")}</span>
                      </Button> */}
                    </div>
                  </Col>
                </Row>
              </div>
            </Container>
            {/* <div className="separator separator-bottom separator-skew zindex-100">
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
            </div> */}
          </section>
        </div>

        <Modal isOpen={showTTLModal} toggle={() => setShowTTLModal(!showTTLModal)}>
          <ModalHeader toggle={() => setShowTTLModal(!showTTLModal)}>
            Change Data Retention Period (TTL)
          </ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label for="newTTL">New TTL (in months)</Label>
                <Input
                  type="number"
                  id="newTTL"
                  value={newTTL}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,2}$/.test(value)) { // Allows only up to 2 digits
                      setNewTTL(value);
                    }
                  }}
                  placeholder="Enter TTL in months (e.g., 6)"
                  disabled={modalSuccessMessage ? true : false}
                  min="1"
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
                onClick={handleTTLSubmit}
                disabled={loading || newTTL.length === 0 || newTTL <= 0}
              >
                {loading ? <Spinner size="sm" /> : 'Submit'}
              </Button>
            )}
            <Button color="secondary" onClick={() => setShowTTLModal(false)}>
              {modalSuccessMessage ? 'Close' : 'Cancel'}
            </Button>
          </ModalFooter>
        </Modal>

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
            <Row className="justify-content-between align-items-center mb-3">
              <Col>
                <h3>{t("allOrders")}</h3>
              </Col>
              <Col className="d-flex justify-content-end">
                <Button color="github" onClick={exportToCSV}>
                  {t("exportCSV")}
                </Button>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col lg="12">
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
                                <td>{order.userId?.email || "N/A"}</td>
                                <td>{order.timeBought}</td>
                                <td>€{order.totalCost}</td>
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
                  disabled={
                    loading || newTvNumber.length !== 4// Disable when loading or input invalid
                  }
                >
                  {loading ? (
                    <Spinner size="sm" /> // Show spinner when loading
                  ) : (
                    t("Submit") // Default label
                  )}
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
      <Col lg="12">
        <h3 className="text-center">{t("manageTvs")}</h3>
        <div className="text-center mt-4 d-flex justify-content-between align-items-center">
          {/* Display Total Balance */}
          <span>
            <strong>{t("totalBalance")}:</strong> {filteredTVs.length > 0 ? (filteredTVs[0].balance / 100) : 0}€
          </span>

          {/* Add TV and Activate All Buttons */}
          <div>
            <Button
              color="primary"
              onClick={() => {
                setShowAddTVModal(true);
                setAddTVError('');
                setAddTVSuccess('');
              }}
              disabled={deviceWarning}
            >
              {t("addTv")}
            </Button>

            <Button
              color="primary"
              onClick={() => setShowActivateAllModal(true)}
              //disabled={deviceWarning}
            >
              {t("activateAll")}
            </Button>
          </div>
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
        {deviceWarning && <Alert color="warning">{deviceWarning}</Alert>}

        {/* Scrollable Table for TVs */}
        <div style={{ maxHeight: "400px", overflowY: "scroll", marginTop: "20px" }}>
          <Table bordered responsive>
            <thead>
              <tr>
                <th>{t("tvNumber")}</th>
                <th>{t("state")}</th>
                <th>{t("remainingDuration")}</th>
                <th>{t("setBonus")}</th>
                <th>{t("setTime")}</th>
                <th>{t("actions")}</th>
                <th></th> {/* Nameless column for delete icon */}
              </tr>
            </thead>
            <tbody>
              {/* Group TVs by first 2 digits of tvNumber */}
              {Object.entries(
                filteredTVs.reduce((groups, tv) => {
                  const groupKey = tv.tvNumber.substring(0, 2); // First 2 digits
                  if (!groups[groupKey]) {
                    groups[groupKey] = [];
                  }
                  groups[groupKey].push(tv);
                  return groups;
                }, {})
              ).sort(([groupKeyA], [groupKeyB]) => groupKeyA.localeCompare(groupKeyB)) // Sort groups by group key in ascending order
              .map(([groupKey, group]) => {
                return group.sort((a, b) => a.tvNumber.localeCompare(b.tvNumber)) // Sort TVs within each group by tvNumber in ascending order
                  .map((tv) => (
                  <tr key={tv._id}>
                    <td>{tv.tvNumber}</td>

                    <td>
                      <Button
                        color={tv.state === "on" ? "success" : "secondary"} // Dynamic button color
                        onClick={() => toggleTVState(tv.tvNumber, tv.state)}
                        disabled={loadingTV === tv.tvNumber || deviceWarning} // Disable button during loading
                      >
                        {loadingTV === tv.tvNumber ? (
                          <Spinner size="sm" /> // Show spinner during loading
                        ) : (
                          tv.state === "on" ? "ON" : "OFF" // Display dynamic label
                        )}
                      </Button>
                    </td>
                    <td>{tv.remainingDuration} {t("minutes")}</td>
                    <td>
                      <Input
                        type="number"
                        placeholder={t("setBonus")}
                        value={tv.newBonus || ""}
                        onChange={(e) => handleBonusChange(tv.tvNumber, e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        placeholder={t("setTime")}
                        value={tv.newSetTime || ""}
                        onChange={(e) => handleSetTimeChange(tv.tvNumber, e.target.value)}
                      />
                    </td>
                    <td>
                      <Button
                        color="primary"
                        onClick={() => handleSendConfiguration(tv.tvNumber)}
                        disabled={deviceWarning}
                      >
                        {t("sendConfig")}
                      </Button>
                    </td>
                    <td>
                      <Button
                        color="danger"
                        onClick={() => deleteTV(tv.tvNumber)}
                        disabled={deviceWarning}
                      >
                        <i className="fa fa-trash" />
                      </Button>
                    </td>
                  </tr>
                ));
              })}
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
              disabled={loading || newAddTvNumber.length !== 4} // Enable only if TV number is 4 digits
            >
              {loading ? (
                <Spinner size="sm" /> // Show spinner when loading
              ) : (
                t("Submit") // Default label
              )}
            </Button>
          )}
          <Button color="secondary" onClick={() => setShowAddTVModal(false)}>
            {addTVSuccess ? t("close") : t("cancel")}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showActivateAllModal} toggle={() => setShowActivateAllModal(false)}>
      <ModalHeader toggle={() => setShowActivateAllModal(false)}>Activate All TVs</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="groupNumber">Specify Group Number</Label>
          <Input
            type="text"
            id="groupNumber"
            value={groupNumber}
            onChange={(e) => setGroupNumber(e.target.value)}
            placeholder="Enter group number"
          />
        </FormGroup>
        <FormGroup>
          <Label for="minutes">Specify Minutes</Label>
          <Input
            type="number"
            id="minutes"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Enter minutes"
          />
        </FormGroup>
        {error && <Alert color="danger">{error}</Alert>}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleActivateSubmit} disabled={loading || deviceWarning}>
          {loading ? <Spinner size="sm" /> : 'Submit'}
        </Button>
        <Button color="secondary" onClick={() => setShowActivateAllModal(false)}>Cancel</Button>
      </ModalFooter>
    </Modal>
        </main>
      <SimpleFooter />
    </>
  );
};

export default AdminIndex;
