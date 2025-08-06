import React, { useState, useEffect, useContext } from "react";
import Footer from "../assets/components/Footer";
import Navbar from "../assets/components/Navbar";
import { AuthContext } from "../context/AuthContext";
import MessageBanner from "../assets/components/MessageBanner";
import "../styles/MessagePage.css";




const MessagePage = () => {

  const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];


  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [user, setUser] = useState();
  const { token } = useContext(AuthContext);
  const [messageStatus, setMessageStatus] = useState({
    message: "",
    type: "info"
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "https://api.cribconnect.xyz/v1/threads/:user_id",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!response.ok) {
          setMessageStatus({
            message: "Something went wrong",
            type: "error"
          });
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        return err.message;
      } finally {
        return false;
      }
    };

    fetchUsers();
  }, [token]); // Empty dependency array = runs once on component mount

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
      <div className='message-page'>
        <div className='sidebar'>
          <h2>Chats</h2>
          <ul>
            {users.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={selectedUser?.id === user.id ? "active" : ""}
              >
                {user.fname + user.lname}
              </li>
            ))}
          </ul>
        </div>

        <div className='chat-window'>
          {selectedUser ? (
            <>
              <div className='chat-header'>Chat with {selectedUser.name}</div>
              <div className='chat-box'>
                {(messages[selectedUser.id] || []).map((msg, index) => (
                  <div key={index} className='chat-message'>
                    <strong>{msg.sender}: </strong>
                    {msg.text}
                  </div>
                ))}
                <ChatInput onSend={handleSend} />
              </div>
              
            </>
          ) : (
            <div className='no-chat'>Select a user to start chatting</div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

function ChatInput({ onSend }) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    onSend(input);
    setInput("");
  };

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
