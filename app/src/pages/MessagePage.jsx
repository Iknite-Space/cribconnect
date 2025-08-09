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
    <>
      <Navbar />
      <MessageBanner
        message={messageStatus.message}
        type={messageStatus.type}
        clear={() => setMessageStatus({ message: "", type: "info" })}
      />
      <Threads updateThread={setThread} />
      <div className='message-page'>
        {thread ? <Messages threadId={thread?.id} /> : null}
      </div>
      <Footer />
    </>
  );
};

export default MessagePage;
