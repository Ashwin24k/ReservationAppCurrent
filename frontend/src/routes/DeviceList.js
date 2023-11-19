import React, { useState, useEffect } from 'react';
import './DeviceList.css';

const DeviceList = () => {
  // State variables for managing devices, modal visibility, user name, selected device, and search term
  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch devices from the server on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/devices');
        const data = await response.json();
        setDevices(data);
      } catch (error) {
        console.error('Error fetching devices: ', error);
      }
    };

    fetchData();
  }, []);

  // Function to handle reserving a device and updating state
  const handleReserve = (device) => {
    setSelectedDevice(device);
    setShowModal(true);
    setUserName('');
  };

  // Function to close the modal and reset user name and selected device
  const handleModalClose = () => {
    setShowModal(false);
    setUserName('');
    setSelectedDevice(null);
  };

  // Function to confirm device reservation and update state
  const handleReserveConfirm = () => {
    if (selectedDevice) {
      const requestBody = { deviceId: selectedDevice.tag_number, userName };
      console.log('Reservation Request Body:', requestBody);

      fetch('/api/reserveDevice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Reservation Response:', data);

          // Fetch and update devices after reservation
          fetch('/api/devices')
            .then((response) => response.json())
            .then((updatedDevices) => {
              // Remove the reserved device from the devices state
              const updatedDeviceList = devices.filter(device => device.tag_number !== selectedDevice.tag_number);
              setDevices(updatedDeviceList);
            })
            .catch((error) => console.error('Error fetching updated devices: ', error));
        })
        .catch((error) => console.error('Error reserving device: ', error));

      setShowModal(false);
      setUserName('');
      setSelectedDevice(null);
    }
  };

  // Filter devices based on the search term
  const filteredDevices = devices.filter((device) =>
    device.model_category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render the component
  return (
    <div>
      <h1>Available Device List</h1>
      {/* Search box for filtering devices by model category */}
      <div className="search-container">
        <input
          className="search-box"
          type="text"
          placeholder="Search by Model Category"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="search-icon">🔍</div>
      </div>
      
      {/* Table to display device information */}
      <table>
        <thead>
          <tr>
            <th>Tag Number</th>
            <th>Model Category</th>
            <th>Model Name</th>
            <th>Serial Number</th>
            <th>Location</th>
            <th>Department Ownership</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {/* Map through filtered devices and display them in the table */}
          {filteredDevices.map((device) => (
            <tr key={device.tag_number}>
              <td>{device.tag_number}</td>
              <td>{device.model_category}</td>
              <td>{device.model_name}</td>
              <td>{device.serial_number}</td>
              <td>{device.location}</td>
              <td>{device.department_ownership}</td>
              <td>
                {/* Display a button to request reservation if the device is available */}
                {!device.res_req_status && (
                  <button onClick={() => handleReserve(device)}>Request Reservation</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for entering user name when reserving a device */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleModalClose}>
              &times;
            </span>
            <h3>Enter Your NetID</h3>
            <input
              type="text"
              placeholder="NetID"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <button onClick={handleReserveConfirm}>Reserve</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceList;