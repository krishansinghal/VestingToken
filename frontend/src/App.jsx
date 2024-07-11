import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Admin from './Admin';
import Beneficiary from './Beneficiary';
import MainPage from './MainPage';

function App() {
  return (
    <div className='bg-dark'>
    <Router>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/beneficiary" element={<Beneficiary />} />
        <Route path="/" element={<MainPage/>} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
