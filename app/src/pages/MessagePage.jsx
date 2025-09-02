import React, { useState } from "react";
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
   const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    
    <div className='message-page'>
      <Navbar />
      <div className='message-container'>
        <Threads updateThread={(thread) => {
          setThread(thread)
          setSidebarOpen(false);
        }} onPayment={setPaymentData}  isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen}/>
        <Messages thread={thread} 
         paymentResponse={paymentData} 
         isUnlocked={thread} 
         name={selectedName}
         clearPayment={() => 
          setPaymentData(null)
        }/>
      </div>
      {!isSidebarOpen && (
  <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>
    Show Chats
  </button>
)}
    </div>
  );
};

export default MessagePage;
