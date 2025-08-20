import useThreads from "../hooks/useThreads";
import "./Threads.css";

// To do replace this with auth context
// const user_id = 1;

const Threads = ({ updateThread }) => {
  const { threads, isLoading, error } = useThreads(); //user_id
  console.log("threads type:", typeof threads);
  console.log("isArray:", Array.isArray(threads));
  console.log("threads:", threads);

  const threadArray = Array.isArray(threads) ? threads : threads.names || [];
  // console.log("error", error)


  return (
    <>
      <div className='sidebar'>
        <h2>Chats</h2>
        {threadContent(threadArray, isLoading, error, updateThread)}
      </div>
    </>
  );
};

const threadContent = (threads, isLoading, error, updateThread) => {
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
       {threads.map(({user, unlocked}) => (
        <li key={user.user_id} className={unlocked ? 'unlocked' : 'locked'}
         onClick={() => unlocked && updateThread(threads)}>
          {user.fname?.trim()} {user.lname?.trim()}
          {!unlocked && <span className="lock-icon">🔒</span>}
        </li>
      ))} 
    </ul>
  );
};

export default Threads;
