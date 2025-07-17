// src/components/Spinner.jsx
import React from 'react';
import './LoadingSpinner.css'; // Separate styling for modularity

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="spinner-container">
    <div className="spinner"></div>
    <p>{message}</p>
  </div>
);

export default LoadingSpinner;
