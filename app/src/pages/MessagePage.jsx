import React, { useState } from "eact";
import Header from "../components/Header";
import Footer from "../assets/components/Footer";
import "../styles/MessagePage.css";

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
];

function MessagePage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});

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
      <Header />
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
                {user.name}
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
              </div>
              <ChatInput onSend={handleSend} />
            </>
          ) : (
            <div className='no-chat'>Select a user to start chatting</div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

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
