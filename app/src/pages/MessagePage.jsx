import React, { useState, useEffect, useContext } from "react";
import Footer from "../assets/components/Footer";
import Navbar from "../assets/components/Navbar";
import { AuthContext } from "../context/AuthContext";
import MessageBanner from "../assets/components/MessageBanner";
import Messages from "../components/Messages";
import "../styles/MessagePage.css";




const MessagePage = () => {

  const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];


  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const { token } = useContext(AuthContext);
  const [messageStatus, setMessageStatus] = useState({
    message: "",
    type: "info"
  });

  const { user, isLoading, error } = useUser(selectedUser?.id);

  const handleSend = (text) => {
    if (!text || !selectedUser) return;

    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [
        ...(prev[selectedUser.id] || []),
        { sender: "You", text }
      ]
    }));
  };

  return (
    <>
      <Navbar />
      <MessageBanner
        message={messageStatus.message}
        type={messageStatus.type}
        clear={() => setMessageStatus({ message: "", type: "info" })}
      />
      <Messages selectedUser={selectedUser} />
      <Footer />
    </>
  );
};




function ChatInput() {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    onSend(input);
    setInput("");
  };

  const onSend = (text) => {
    if (!text) return;
    // Logic to send the message
    useSend(text);
  }

  return (
    <div className='chat-input'>
      <input
        type='text'
        placeholder='Type your message...'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
}

export default MessagePage;
