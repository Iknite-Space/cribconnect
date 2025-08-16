import React, { useEffect, useRef, useState } from "react";
import useMessages from "../hooks/useMessages";
import ChatBox from "./ChatBox";
import Banner from "./Banner";
import "./Messages.css";

const Messages = ({ threadId }) => {
  const { messages, isLoading } = useMessages(threadId);
  const [localMessages, setLocalMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new messages come
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) return <div>Loading messages...</div>;
  // if (error && error.code !== 404)
  //   return <div>Error loading messages: {error.message}</div>;
  // if (messages && messages.length === 0)
  //   return (
  //     <div>
  //       <em>--No messages--</em>
  //     </div>
  //   );
  // if (messages && isLocked)
  //   return <div>This chat is locked. Please pay first.</div>;

  return (
    <>
      <div className='chat-window'>
        <div className='banner'>
          <Banner />
        </div>
        <div className='chat-messages'>
          {(localMessages || []).map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.sender === "You" ? "sender" : "recipient"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className='chat-input'>
          <ChatBox sendMessage={setLocalMessages} />
        </div>
      </div>
    </>
  );
};

export default Messages;
