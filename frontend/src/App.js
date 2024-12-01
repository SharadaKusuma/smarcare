import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Correct paths based on folder structure
import HomePage from './components/HomePage/HomePage';  // Correct path for HomePage
import PatientInterface from './components/PatientInterface/PatientInterface';  // Correct path for PatientInterface
import CanteenInterface from './components/CanteenInterface/CanteenInterface';  // Correct path for CanteenStaff

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/patient" element={<PatientInterface />} />
        <Route path="/canteen" element={<CanteenInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
