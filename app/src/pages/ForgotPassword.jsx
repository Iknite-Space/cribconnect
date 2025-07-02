// src/components/ForgotPassword.jsx
import React, { useState } from 'react';
import { resetPassword } from '../features/auth/firebaseAuth';
import '../styles/ForgotPassword.css'; // optional: for styling



const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await resetPassword( email);
      setStatus('✅ Password reset email sent, if an account with that email exists!');
    } catch (error) {
      setStatus(`⚠️ ${error.message}`);
    }
  };

  return (
    <div className="forgot-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Email</button>
      </form>
      {status && <p className="status">{status}</p>}
    </div>
  );
};

export default ForgotPassword;
