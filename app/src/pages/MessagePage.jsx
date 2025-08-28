import React, { useState } from "react";
import Footer from "../assets/components/Footer";
import Navbar from "../assets/components/Navbar";
import Threads from "../components/Threads";
import Messages from "../components/Messages";
import "../styles/MessagePage.css";

const MessagePage = () => {
  const [thread_id, setThread] = useState(null);
  const selectedName = thread_id
  ? `${thread_id.user?.fname || ""} ${thread_id.user?.lname || ""}`.trim()
  : "";

   const [paymentData, setPaymentData] = useState(null);
  return (
    <div className='message-page'>
      <Navbar />
      
      <div className='message-container'>
        <Threads updateThread={setThread} onPayment={setPaymentData} />
        <Messages threadId={thread_id} 
         paymentResponse={paymentData} 
         isUnlocked={thread_id} 
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
