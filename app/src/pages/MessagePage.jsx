import React, { useState } from "react";
import Footer from "../assets/components/Footer";
import Navbar from "../assets/components/Navbar";

import Messages from "../components/Messages";
import MessageBanner from "../assets/components/MessageBanner";
import "../styles/MessagePage.css";

const MessagePage = () => {
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
      <div className='message-page'>
        <Messages />
      </div>
      <Footer />
    </>
  );
};

export default MessagePage;
