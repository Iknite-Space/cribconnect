import React, { useState } from "react";
import Footer from "../assets/components/Footer";
import Navbar from "../assets/components/Navbar";
import Threads from "../components/Threads";
import Messages from "../components/Messages";
import MessageBanner from "../assets/components/MessageBanner";
import "../styles/MessagePage.css";

const MessagePage = () => {
  const [thread, setThread] = useState(null);
  const [messageStatus, setMessageStatus] = useState({
    message: "",
    type: "info"
  });

  return (
    <div className='message-page'>
      <Navbar />
      <MessageBanner
        message={messageStatus.message}
        type={messageStatus.type}
        clear={() => setMessageStatus({ message: "", type: "info" })}
      />
      
      <div className='message-container'>
        <Threads updateThread={setThread} />
        <Messages threadId={thread?.id} />
        {/* {thread ? <Messages threadId={thread?.id} /> : null} */}
      </div>
      <div className='footer-container'><Footer /></div>
      
    </div>
  );
};

export default MessagePage;
