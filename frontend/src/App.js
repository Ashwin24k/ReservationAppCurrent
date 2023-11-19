import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DeviceList from './routes/DeviceList';
import RoomList from './routes/RoomList';
import Navbar from './components/Navbar';
import AdminPanel from './routes/AdminPanel';
import './App.css';

const App=()=> {
  return (
    <Router>
      <div>
        <Navbar/>
        <Routes>
          <Route path="/devices" element={<DeviceList />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;