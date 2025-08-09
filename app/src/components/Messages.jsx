import useMessages from "../hooks/useMessages";
import { useState } from "react";
import "./Messages.css";

const Messages = ({ threadId }) => {
  const { messages, isLocked, isLoading, error } = useMessages(threadId);

  if (isLoading) return <div>Loading messages...</div>;
  if (error && error.code !== 404)
    return <div>Error loading messages: {error.message}</div>;
  if (messages && messages.length === 0) return <div>No messages.</div>;
  if (messages && isLocked)
    return <div>This chat is locked. Please pay first.</div>;
  return (
    <>
      <div className='chat-window'>
        {(messages || []).map((msg, index) => (
          <div key={index} className='message'>
            <strong>{msg.sender}: </strong>
            {msg.text}
          </div>
        ))}
      </div>
    </>
  );
};

export default Messages;
