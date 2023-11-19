import React, { useState, useEffect } from 'react';
import './RoomList.css'; 

const RoomList = () => {
  // State variables for managing rooms, modal visibility, user netID, selected room, and search term
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [userNetID, setUserNetID] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(''); // Use a single state for start and end time
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch rooms from the server on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error('Error fetching rooms: ', error);
      }
    };

    fetchData();
  }, []);

  // Function to handle reserving a room and opening the modal
  const handleReserve = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
    // Reset form fields
    setUserNetID('');
    setEventTitle('');
    setReservationDate('');
    setTimeSlot('');
  };

  // Function to close the modal and reset user netID, selected room, and other fields
  const handleModalClose = () => {
    setShowModal(false);
    setUserNetID('');
    setSelectedRoom(null);
    setEventTitle('');
    setReservationDate('');
    setTimeSlot('');
  };

  // Function to confirm room reservation and update state
  const handleReserveConfirm = () => {
    if (selectedRoom && timeSlot) {
      // Split the time slot into start and end times
      const [startTime, endTime] = timeSlot.split('-');

      const requestBody = {
        room_reservation_id: selectedRoom.room_reservation_id,
        user_netID: userNetID,
        event_title: eventTitle,
        reservation_date: reservationDate,
        start_time: startTime.trim(),
        end_time: endTime.trim(),
      };

      console.log('Reservation Request Body:', requestBody);

      // Make a reservation request to the server
      fetch('/api/reserveRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Reservation Response:', data);

          // Fetch and update rooms after reservation
          fetch('/api/rooms')
            .then((response) => response.json())
            .then((updatedRooms) => setRooms(updatedRooms))
            .catch((error) => console.error('Error fetching updated rooms: ', error));
        })
        .catch((error) => console.error('Error reserving room: ', error));

      setShowModal(false);
      setUserNetID('');
      setSelectedRoom(null);
      setEventTitle('');
      setReservationDate('');
      setTimeSlot('');
    }
  };

  // Filter rooms based on the search term
  const filteredRooms = rooms.filter((room) => room.room.toLowerCase().includes(searchTerm.toLowerCase()));

  // Render the component
  return (
    <div>
      <h1>Available Room List</h1>
      {/* Search box for filtering rooms by room name */}
      <div className="search-container">
        <input
          className="search-box"
          type="text"
          placeholder="Search by Room"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="search-icon">🔍</div>
      </div>

      {/* Table to display room information */}
      <table>
        <thead>
          <tr>
            <th>Room</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {/* Map through filtered rooms and display them in the table */}
          {filteredRooms.map((room) => (
            <tr key={room.room_reservation_id}>
              <td>{room.room}</td>
              <td>
                {/* Display a button to request reservation if the room is available */}
                {!room.user_netID && (
                  <button onClick={() => handleReserve(room)}>Reserve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for entering user netID and reservation details when reserving a room */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleModalClose}>
              &times;
            </span>
            <h3>Enter Reservation Details</h3>
            <label>
              User NetID:
              <input
                type="text"
                placeholder="User NetID"
                value={userNetID}
                onChange={(e) => setUserNetID(e.target.value)}
              />
            </label>
            <label>
              Event Title:
              <input
                type="text"
                placeholder="Event Title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </label>
            <label>
              Reservation Date:
              <input
                type="date"
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
              />
            </label>
            <label>
              {/* Dropdown for time slot selection */}
              Select Time Slot:
              <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                <option value="">Select Time Slot</option>
                <option value="08:00-10:00">8:00 AM - 10:00 AM</option>
                <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                <option value="12:00-14:00">12:00 PM - 2:00 PM</option>
                <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
              </select>
            </label>
            <button onClick={handleReserveConfirm}>Reserve</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;