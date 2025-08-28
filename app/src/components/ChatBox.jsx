import React, { useState } from "react";
import "./ChatBox.css";

const ChatBox = ({ sendMessage }) => {
  const [input, setInput] = useState("");

  const handleSend = (messageHandler) => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: [input],
      sender: "You"
    };

    // Simulate response after 1 second
    const simulatedReply = {
      id: Date.now() + 1,
      text: `${input}`,
      recipient: "Bot"
    };

    messageHandler((prev) => [...prev, newMessage]);
    setInput("");

    setTimeout(() => {
      messageHandler((prev) => [...prev, simulatedReply]);
    }, 1000);
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
        onClick={() => handleSend(sendMessage)}
      >
        Send
      </button>
    </div>
  );
};

export default ChatBox;
