import { useEffect,useState, useRef} from "react";
import useThreads from "../hooks/useThreads";
import "./Threads.css";

const Threads = ({ updateThread, onPayment, isSidebarOpen, setSidebarOpen}) => {
  const { threads, payThread, paymentResponse,  isLoading, error, deleteThread } = useThreads();

  const threadArray = Array.isArray(threads) ? threads : threads.names || [];

     const panelRef = useRef(null);
     const [threadToDelete, setThreadToDelete] = useState(null); // modal state

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

  const confirmDelete = () => {
    if (threadToDelete) {
      deleteThread(threadToDelete.thread_id);
      setThreadToDelete(null);
    }
  };

  return (
    <>
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`} ref={panelRef}>
        <h2>Chats</h2>
        {threadContent(threadArray, isLoading, error, updateThread, payThread, deleteThread,  setThreadToDelete)}
      </div>

       {threadToDelete && (
        <div className="modalc-overlay">
          <div className="modalc">
            <p>
              Are you sure you want to delete{" "}
              <strong>
                {threadToDelete.user.fname} {threadToDelete.user.lname}
              </strong>
              ?
            </p>
            <div className="modalc-buttons">
              <button className="yes-btn" onClick={confirmDelete}>
                Yes
              </button>
              <button className="no-btn" onClick={() => setThreadToDelete(null)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const threadContent = (threads, isLoading, error, updateThread, payThread, deleteThread,  setThreadToDelete) => {
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
    <div className="thread-container">
    <ul className="thread-list">
       {threads.map(({thread_id, user, unlocked}) => (
        <li 
           key={user.user_id}
          className={unlocked ? 'unlocked' : 'locked'}>
             <span
              className="thread-name"
          onClick={() =>
            unlocked 
             ? updateThread({thread_id, unlocked, user}) 
             : payThread(user.user_id)
             }
        >
         
          {user.fname?.trim()} {user.lname?.trim()}
          {!unlocked && <span className="lock-icon">🔒</span>}
      </span>
         
           <button
              className="delete-icon"
              onClick={(e) => {
                e.stopPropagation();
                 setThreadToDelete({ thread_id, user });
                console.log(thread_id)
              }}
            >
              ❌
            </button>
        </li>
      ))} 
    </ul>
   
    </div>
  );
};

export default Threads;
