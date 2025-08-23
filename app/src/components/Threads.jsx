import { useEffect } from "react";
import useThreads from "../hooks/useThreads";
import "./Threads.css";

const Threads = ({ updateThread, onPayment }) => {
  const { threads, payThread, paymentResponse,  isLoading, error } = useThreads();

  const threadArray = Array.isArray(threads) ? threads : threads.names || [];

  useEffect(() => {
    if(paymentResponse) {
      onPayment(paymentResponse);
      console.log("payment",paymentResponse)
    }
  }, [paymentResponse, onPayment]);

  return (
    <>
      <div className='sidebar'>
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
