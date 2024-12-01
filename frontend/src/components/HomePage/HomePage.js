import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './/HomePage.css';

function HomePage() {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <header>
        <h1>Welcome to Smarcare</h1>
      </header>
      <p>Please select your role:</p>
      <Link to="/patient">
        <button style={{ margin: '10px', padding: '10px', fontSize: '16px' }}>I am a Patient</button>
      </Link>
      <Link to="/canteen">
        <button style={{ margin: '10px', padding: '10px', fontSize: '16px' }}>I am a Canteen Staff Member</button>
      </Link>
    </div>
  );
}

export default HomePage;
