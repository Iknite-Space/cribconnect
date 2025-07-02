// components/MessageBanner.jsx
import React, { useEffect } from 'react';
import './MessageBanner.css'; // Optional: style separately

const MessageBanner = ({ message, clear }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => clear(), 4000); // Auto-hide after 4s
      return () => clearTimeout(timer);
    }
  }, [message, clear]);

  if (!message) return null;

  return (
    <div className="top-left-message">
      {message}
    </div>
  );
};

export default MessageBanner;
