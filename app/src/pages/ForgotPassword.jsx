// src/components/ForgotPassword.jsx
import React, { useState } from 'react';
import '../styles/ForgotPassword.css'; // optional: for styling



const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault();
      if (submitting) return; // ⛔ prevent double submits

      setSubmitting(true);
    setStatus(''); // reset status
    try {
     
     //http://localhost:8081
      const response = await fetch('https://api.cribconnect.xyz/v1/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        
      });
      

      const result = await response.json();
        // console.log(result)
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setStatus('✅ Password reset email sent, if an account with that email exists!');
    } catch (error) {
      setStatus(`⚠️ ${error.message}`);
    } finally {
      setSubmitting(false)
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
        <button type="submit" disabled={submitting}>
  {submitting ? 'Sending...' : 'Send Reset Email'}</button>
      </form>
      {status && <p className="status">{status}</p>}
    </div>
  );
};

export default ForgotPassword;
