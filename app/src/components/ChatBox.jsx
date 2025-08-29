import React, { useState } from "react";
import "./ChatBox.css";

const ChatBox = ({ onSend }) => {
  const [input, setInput] = useState("");

   const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className='chat-input-container'>
      <>
        <input
          className='chatbox-input'
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Type your message...'
        />
      </>
      <button
        className='chatbox-button'
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
};

export default ChatBox;
