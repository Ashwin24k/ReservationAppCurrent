require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.REACT_APP_HOST,
  user: process.env.REACT_APP_USER,
  password: process.env.REACT_APP_DB_PASSWORD,
  database: process.env.REACT_APP_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Endpoint to fetch available devices
app.get('/api/devices', (req, res) => {
  const query = 'SELECT * FROM current_devices WHERE res_req_status = false';

  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching available devices: ' + err.message);
      res.status(500).json({ error: 'Error fetching available devices' });
    } else {
      res.json(results);
    }
  });
});

// Endpoint to handle device reservation requests
app.post('/api/reserveDevice', (req, res) => {
  const { deviceId, userName } = req.body;

  console.log('Device Reservation Request Body:', req.body);

  if (!deviceId || !userName) {
    return res.status(400).json({ error: 'Device ID and user name are required.' });
  }

  // Check if the device is available for reservation
  const checkAvailabilityQuery = 'SELECT * FROM current_devices WHERE tag_number = ? AND res_req_status = false';

  pool.query(checkAvailabilityQuery, [deviceId], (checkError, availabilityResults) => {
    if (checkError) {
      console.error('Error checking device availability:', checkError);
      return res.status(500).json({ error: 'An error occurred while checking device availability.' });
    }

    if (availabilityResults.length === 0) {
      return res.status(400).json({ error: 'Device is not available for reservation.' });
    }

    // Device is available, create a reservation request
    const insertSql = 'INSERT INTO reservation_requests (tag_number, user_netID, model_category, model_name, serial_number, location, assigned_to, funding_source, department_ownership, po_number, warranty_expiration) SELECT tag_number, ?, model_category, model_name, serial_number, location, assigned_to, funding_source, department_ownership, po_number, warranty_expiration FROM current_devices WHERE tag_number = ?';

    pool.query(insertSql, [userName, deviceId], (insertError) => {
      if (insertError) {
        console.error('Error creating reservation request:', insertError);
        res.status(500).json({ error: 'An error occurred during reservation request creation.' });
      } else {
        console.log('Reservation Request created successfully!');
        res.json({ message: 'Reservation request created successfully.' });
      }
    });
  });
});

// Endpoint to fetch available rooms
app.get('/api/rooms', (req, res) => {
  const query = 'SELECT room_reservation_id, room, user_netID FROM room_reservations WHERE user_netID IS NULL';

  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching available rooms: ' + err.message);
      res.status(500).json({ error: 'Error fetching available rooms' });
    } else {
      res.json(results);
    }
  });
});

// Endpoint to handle room reservations
app.post('/api/reserveRoom', (req, res) => {
  const { room_reservation_id, user_netID, event_title, reservation_date, start_time, end_time } = req.body;

  console.log('Room Reservation Request Body:', req.body);

  if (!room_reservation_id || !reservation_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Room Reservation ID, reservation date, start time, and end time are required.' });
  }

  const updateSql = 'UPDATE room_reservations SET user_netID = ?, event_title = ?, reservation_date = ?, start_time = ?, end_time = ? WHERE room_reservation_id = ?';
  pool.query(updateSql, [user_netID, event_title, reservation_date, start_time, end_time, room_reservation_id], (updateError) => {
    if (updateError) {
      console.error('Error updating room reservation:', updateError);
      res.status(500).json({ error: 'An error occurred during room reservation.' });
    } else {
      console.log('Room Reservation successful!');
      res.json({ message: 'Room reserved successfully.' });
    }
  });
});

// Endpoint to fetch reservation requests excluding approved ones
app.get('/api/admin/requests', (req, res) => {
  const query = 'SELECT * FROM reservation_requests WHERE res_req_status = false';

  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching reservation requests: ' + err.message);
      res.status(500).json({ error: 'Error fetching reservation requests' });
    } else {
      res.json(results);
    }
  });
});

// Endpoint to update reservation request status
app.put('/api/admin/requests/:requestId', (req, res) => {
  const { requestId } = req.params;
  const { decision } = req.body;

  if (!requestId || !decision) {
    return res.status(400).json({ error: 'Request ID and decision are required.' });
  }

  // Check if the decision is valid ('approve' or 'disapprove')
  if (decision !== 'approve' && decision !== 'disapprove') {
    return res.status(400).json({ error: 'Invalid decision. Use "approve" or "disapprove".' });
  }

  if (decision === 'disapprove') {
    // If disapproving, remove the device from the reservation_requests table
    const removeSql = 'DELETE FROM reservation_requests WHERE request_id = ?';

    pool.query(removeSql, [requestId], (removeError) => {
      if (removeError) {
        console.error('Error removing reservation request:', removeError);
        res.status(500).json({ error: 'An error occurred during removal.' });
      } else {
        console.log('Reservation Request removed successfully!');
        res.json({ message: 'Reservation request removed successfully.' });
      }
    });
  } else {
    // Update reservation request status based on the decision
    const updateSql = 'UPDATE reservation_requests SET res_req_status = ? WHERE request_id = ?';

    // If the decision is 'approve', set res_req_status to true; otherwise, set it to false
    const approvalStatus = decision === 'approve';

    pool.query(updateSql, [approvalStatus, requestId], (updateError) => {
      if (updateError) {
        console.error('Error updating reservation request status:', updateError);
        res.status(500).json({ error: 'An error occurred during status update.' });
      } else {
        console.log('Reservation Request status updated successfully!');

        // If the request is approved, update the current_devices table as well
        if (approvalStatus) {
          const getRequestSql = 'SELECT * FROM reservation_requests WHERE request_id = ?';

          pool.query(getRequestSql, [requestId], (getRequestError, requestResult) => {
            if (getRequestError) {
              console.error('Error fetching request details:', getRequestError);
              res.status(500).json({ error: 'An error occurred while fetching request details.' });
            } else {
              const { tag_number, user_netID } = requestResult[0];

              // Update current_devices table with assigned_to and res_req_status
              const updateDevicesSql = 'UPDATE current_devices SET assigned_to = ?, res_req_status = true WHERE tag_number = ?';
              pool.query(updateDevicesSql, [user_netID, tag_number], (updateDevicesError) => {
                if (updateDevicesError) {
                  console.error('Error updating current_devices table:', updateDevicesError);
                  res.status(500).json({ error: 'An error occurred during current_devices table update.' });
                } else {
                  console.log('Current Devices table updated successfully!');
                  res.json({ message: 'Reservation request status updated successfully.' });
                }
              });
            }
          });
        } else {
          res.json({ message: 'Reservation request status updated successfully.' });
        }
      }
    });
  }
});

//Endpoint to add devices to database table
app.post('/api/addDevice', (req, res) => {
  const {
    model_category,
    model_name,
    serial_number,
    location,
    funding_source,
    department_ownership,
    po_number,
    warranty_expiration,
  } = req.body;

  const insertSql = `INSERT INTO current_devices (
    model_category,
    model_name,
    serial_number,
    location,
    funding_source,
    department_ownership,
    po_number,
    warranty_expiration,
    res_req_status,
    assigned_to
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, false, null)`;

  const values = [
    model_category,
    model_name,
    serial_number,
    location,
    funding_source,
    department_ownership,
    po_number,
    warranty_expiration,
  ];

  pool.query(insertSql, values, (insertError) => {
    if (insertError) {
      console.error('Error adding new device:', insertError);
      res.status(500).json({ error: 'An error occurred during the device addition.' });
    } else {
      console.log('New Device added successfully!');
      res.json({ message: 'New device added successfully.' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});