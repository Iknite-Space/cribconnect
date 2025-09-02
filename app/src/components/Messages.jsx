import React, { useEffect, useRef, useState } from "react";
import { useChatSocket } from "../hooks/useChatSocket";
import useMessages from "../hooks/useMessages";
import ChatBox from "./ChatBox";
import Banner from "./Banner";
import "./Messages.css";

const Messages = ({ thread, isUnlocked, name, paymentResponse, clearPayment }) => {
  const shouldFetchMessages = !!thread && isUnlocked;
  const { messages, setMessages, isLoading } = useMessages(thread, shouldFetchMessages);
  const messagesEndRef = useRef(null);
 
  const [showModal, setShowModal] = useState(false);

    // Initialize WebSocket connection
    const { sendMessage, profile} = useChatSocket(thread, (incomingMsg) => {
       const normalisedMsg = {
      id: incomingMsg.message_id,
      text: incomingMsg.message_text || incomingMsg.text || incomingMsg.content,
      sender_id: incomingMsg.sender_id,
      receiver_id: incomingMsg.receiver_id,
      sent_at: incomingMsg.sent_at, //|| new Date().toISOString(),
      status: 'confirmed'
    };
      setMessages((prevMessages) => 
           prevMessages.map((msg) =>
          msg.id === incomingMsg.client_temp_id ? normalisedMsg : msg
        ));
    });

  useEffect(() => {
     if (paymentResponse) {
      setShowModal(true);
    }
    if(messages?.length){
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
     }
  }, [messages, paymentResponse]);

  
  
    // Send message via WebSocket
    const handleSend = (text) => {
      if (!thread?.thread_id || text.trim() === '') return; 
        const tempId = Date.now().toString();
         const optimisticincomingMsg = {
          id: tempId,
          message_text: text,
          sender_id: profile.user_id,
          receiver_id: thread.user.user_id,
          sent_at: new Date().toISOString()
        };
         setMessages((prev) => [...prev, optimisticincomingMsg]);

        sendMessage(thread.thread_id, thread.user.user_id, text);
    };

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

      {thread ? (
        <>
        <div className='banner'>
          <Banner name={name} />
        </div>
        <div className='chat-messages'>
          {messages.map((incomingMsg, index) => {
            const msgDate = new Date(incomingMsg.sent_at);
             const time = msgDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              // Format date for comparison
              const msgDay = msgDate.toDateString();
              const prevMsg = messages[index - 1];
              const prevDay = prevMsg ? new Date(prevMsg.sent_at).toDateString() : null;

              // Determine if we need a date divider
              const showDateDivider = msgDay !== prevDay;

              // Create label: Today, Yesterday, or full date
              const today = new Date();
              const yesterday = new Date();
              yesterday.setDate(today.getDate() - 1);

              let dayLabel = msgDay;
              if (msgDate.toDateString() === today.toDateString()) {
                dayLabel = "Today";
              } else if (msgDate.toDateString() === yesterday.toDateString()) {
                dayLabel = "Yesterday";
              }

              return (
            <React.Fragment
              key={index}>
              {showDateDivider && (
                <div className="date-divider">{dayLabel}</div>
              )}
              <div
              className={`message ${
                incomingMsg.sender_id === profile.user_id? "sender" : "recipient"
              }`}
            >
              {incomingMsg.text || incomingMsg.message_text}
              <span className="timestamp">{time}</span>
              </div>
            </React.Fragment>
              );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className='chat-input'>
          <ChatBox onSend={handleSend} />
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
