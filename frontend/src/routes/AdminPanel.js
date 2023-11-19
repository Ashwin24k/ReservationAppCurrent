import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
  // State variables for managing reservation requests, password, authentication, and new device modal
  const [requests, setRequests] = useState([]);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  // State variables for managing new device modal
  const [showModal, setShowModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    model_category: '',
    model_name: '',
    serial_number: '',
    location: '',
    funding_source: '',
    department_ownership: '',
    po_number: '',
    warranty_expiration: '',
  });

  // Function to toggle the new device modal
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  // Function to handle new device form input changes
  const handleNewDeviceChange = (e) => {
    const { name, value } = e.target;
    setNewDevice((prevDevice) => ({ ...prevDevice, [name]: value }));
  };

  // Function to submit the new device form
  const handleNewDeviceSubmit = () => {
    console.log('New Device Data:', newDevice);
    // Make a request to the server to add the new device
    fetch('/api/addDevice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDevice),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Add Device Response:', data);
        // Refresh the reservation requests after adding the new device
        fetchData();
        // Close the modal after submitting the form
        toggleModal();
      })
      .catch((error) => console.error('Error adding new device:', error));
  };

  // Fetch reservation requests from the server on component mount
  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching reservation requests: ', error);
    }
  };

  useEffect(() => {
    // Only fetch data if authenticated
    if (authenticated) {
      fetchData();
    }
  }, [authenticated]);

  // Function to handle approval or disapproval of a reservation request
  const handleDecision = (requestId, decision) => {
    const updateUrl = `/api/admin/requests/${requestId}`;
    const updateBody = { decision };

    fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Update Response:', data);
        fetchData(); // Refresh reservation requests after update
      })
      .catch((error) => console.error('Error updating reservation request: ', error));
  };

  // Function to handle password submission
  const handlePasswordSubmit = () => {
    // Check if the entered password is correct
    // This is temporary while the login functionality needs to be updated
    if (password === 'KSUadmin') {
      setAuthenticated(true);
    } else {
      alert('Incorrect password. Access denied.');
    }
  };

  // Render the component
  return (
    <div className="center-container">
      {!authenticated ? (
        <div>
          <h1>Enter Password to Access Admin Panel</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
          />
          <button onClick={handlePasswordSubmit}>Submit</button>
        </div>
      ) : (
        <div>
          <h1>ACTIVE Reservation Requests</h1>
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Tag Number</th>
                <th>Model Name</th>
                <th>Serial Number</th>
                <th>User NetID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.request_id}>
                  <td>{request.request_id}</td>
                  <td>{request.tag_number}</td>
                  <td>{request.model_name}</td>
                  <td>{request.serial_number}</td>
                  <td>{request.user_netID}</td>
                  <td>{request.res_req_status ? 'Approved' : 'Pending'}</td>
                  <td>
                    {!request.res_req_status && (
                      <>
                        <button onClick={() => handleDecision(request.request_id, 'approve')}>Approve</button>
                        <button onClick={() => handleDecision(request.request_id, 'disapprove')}>Disapprove</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="new-device-section">
            <h1>Add NEW Device to Database</h1>
            <button onClick={toggleModal}>Add New Device</button>
          </div>

          {/* New Device Modal */}
          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={toggleModal}>
                  &times;
                </span>
                <h3>Add New Device</h3>
                {/* Form for entering new device information */}
                <form>
                  <label>
                    Model Category:
                    <input
                      type="text"
                      name="model_category"
                      value={newDevice.model_category}
                      onChange={handleNewDeviceChange}
                    />
                  </label>
                  <label>
                    Model Name:
                    <input
                      type="text"
                      name="model_name"
                      value={newDevice.model_name}
                      onChange={handleNewDeviceChange}
                    />
                  </label>
                  <label>
                    Serial Number:
                    <input
                      type="text"
                      name="serial_number"
                      value={newDevice.serial_number}
                      onChange={handleNewDeviceChange}
                    />
                  </label>
                  <label>
                    Location:
                    <input
                      type="text"
                      name="location"
                      value={newDevice.location}
                      onChange={handleNewDeviceChange}
                    />
                  </label>
                  <label>
                    Funding Source:
                    <input
                      type="text"
                      name="funding_source"
                      value={newDevice.funding_source}
                      onChange={handleNewDeviceChange}
                    />
                  </label>
                  <label>
                    Department Ownership:
                    <input
                      type="text"
                      name="department_ownership"
                      value={newDevice.department_ownership}
                      onChange={handleNewDeviceChange}
                    />
                  </label>
                  <label>
                    PO Number:
                    <input
                      type="text"
                      name="po_number"
                      value={newDevice.po_number}
                      onChange={handleNewDeviceChange}
                    />
                  </label>
                  <label>
                    Warranty Expiration:
                    <input
                      type="date"
                      name="warranty_expiration"
                      value={newDevice.warranty_expiration}
                      onChange={handleNewDeviceChange}
                    />
                  </label>
                  <button type="button" onClick={handleNewDeviceSubmit}>
                    Add Device
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;