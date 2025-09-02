import { useEffect, useRef} from "react";
import useThreads from "../hooks/useThreads";
import "./Threads.css";

const Threads = ({ updateThread, onPayment, isSidebarOpen, setSidebarOpen}) => {
  const { threads, payThread, paymentResponse,  isLoading, error } = useThreads();

  const threadArray = Array.isArray(threads) ? threads : threads.names || [];

     const panelRef = useRef(null);

   useEffect(() => {
    function handleClickOutside(e) {
      // If panel is open and click is outside both the panel and the profile image
      if (
        isSidebarOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target)
        ) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, setSidebarOpen]);

  useEffect(() => {
    if(paymentResponse) {
      onPayment(paymentResponse);
      console.log("payment",paymentResponse)
    }
  }, [paymentResponse, onPayment]);

  return (
    <>
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`} ref={panelRef}>
        <h2>Chats</h2>
        {threadContent(threadArray, isLoading, error, updateThread, payThread)}
      </div>
    </>
  );
};

const threadContent = (threads, isLoading, error, updateThread, payThread) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error && error.code !== 404) {
    return <div>Error message: {error.message}</div>;
  }
  if (!threads || threads.length === 0) {
    return <div>No chats available.</div>;
  }

  return (
    <ul>
       {threads.map(({thread_id, user, unlocked}) => (
        <li key={user.user_id} className={unlocked ? 'unlocked' : 'locked'}
         onClick={() => unlocked ? updateThread({thread_id, unlocked, user}) : payThread(user.user_id)}>
          {user.fname?.trim()} {user.lname?.trim()}
          {!unlocked && <span className="lock-icon">🔒</span>}
        </li>
      ))} 
    </ul>
  );
};

export default Threads;
