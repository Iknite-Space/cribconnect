import React, { useEffect } from 'react';
import './MessageBanner.css';



const MessageBanner = ({ message, type = 'info', clear }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => clear(), 4000);
      return () => clearTimeout(timer);
    }
  }, [message, clear]);

  if (!message) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'error': return '❌';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  // Dynamic class based on type
  const className = `top-left-message ${type}`;

  return (
    <div className={className}>
       <span className="message-icon">{getIcon(type)}</span>
      <span>{message}</span>
    </div>
  );
};

export default MessageBanner;
