import React, { useEffect, useRef, useState } from "react";
import useMessages from "../hooks/useMessages";
import ChatBox from "./ChatBox";
import Banner from "./Banner";
import "./Messages.css";

const Messages = ({ threadId, isUnlocked, name, paymentResponse, clearPayment }) => {
  const shouldFetchMessages = !!threadId && isUnlocked;
  const { messages, isLoading } = useMessages(threadId, shouldFetchMessages);
  const [localMessages, setLocalMessages] = useState([]);
  const messagesEndRef = useRef(null);
 
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
     if (paymentResponse) {
      setShowModal(true);
    }
    if(messages?.length){
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, paymentResponse]);

   const paymentLink = paymentResponse?.paymentLink?.link || null;
  const handlePay = () => {
    const msg = paymentResponse?.paymentLink?.link
    if (msg) {
      window.open(msg, '_blank', 'noopener,noreferrer');
    } else {
      console.log("No payment link available.")
    }
     handleDismiss();
    };

   const handleDismiss = () => {
    setShowModal(false);
    clearPayment();
  };

  if (isLoading) return <div>Loading messages...</div>;
  // if (!isUnlocked) return <div>This chat is locked. Please pay first.</div>;
  return (
    <>
      <div className='chat-window'>
        
              {showModal && paymentResponse && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
           
            <button
              aria-label="Close modal"
              className="modal-close"
              onClick={handleDismiss}
            >
              &times;
            </button>

            <h2 className="modal-title">Make Payment!</h2>
            <p className="modal-text">
              {paymentLink 
              ?"To unlock chat and begin your conversation, click the button below to make a payment of "
              : "Payment link is unavailable. Please try again later."
              }
                 <br/>
                <span className="payment-amount"> 50 XAF </span>
            </p>
            <button className="modal-action" onClick={handlePay}>
              PAY
            </button>
          </div>
        </div>
      )}

      {threadId ? (
        <>
        <div className='banner'>
          <Banner name={name} />
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
        </>
      ) : (
        <div className="select-chat">Please select a chat.</div>
      )}
      </div>
    </>
  );
};

export default Messages;
