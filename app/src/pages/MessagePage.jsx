import React, { useState } from "react";
import Footer from "../assets/components/Footer";
import Navbar from "../assets/components/Navbar";
import Threads from "../components/Threads";
import Messages from "../components/Messages";
import "../styles/MessagePage.css";

const MessagePage = () => {
  const [thread, setThread] = useState(null);
  const selectedName = thread
  ? `${thread.user?.fname || ""} ${thread.user?.lname || ""}`.trim()
  : "";
   const [paymentData, setPaymentData] = useState(null);
  return (
    <div className='message-page'>
      <Navbar />
      
      <div className='message-container'>
        <Threads updateThread={setThread} onPayment={setPaymentData} />
        <Messages thread={thread} 
         paymentResponse={paymentData} 
         isUnlocked={thread} 
         name={selectedName}
         clearPayment={() => 
          setPaymentData(null)
        }/>
      </div>
      <div className='footer-container'><Footer /></div>
      
    </div>
  );
};

export default MessagePage;
