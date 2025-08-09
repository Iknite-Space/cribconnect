import useThreads from "../hooks/useThreads";
import "./Threads.css";

// To do replace this with auth context
const user_id = 1;

const Threads = ({ updateThread }) => {
  const { threads, isLoading, error } = useThreads(user_id);

  return (
    <>
      <div className='sidebar'>
        <h2>Chats</h2>
        {threadContent(threads, isLoading, error, updateThread)}
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
      {threads.map((u) => (
        <li key={u.id} onClick={() => updateThread(u)}>
          {u.name}
        </li>
      ))}
    </ul>
  );
};

export default Threads;
