import useMessages from "../hooks/useMessages";
import "./Messages.css";

const Messages = ({ selectedUser }) => {
  const user = [
    { id: 1, name: "Bob" },
    { id: 2, name: "Allen" },
    { id: 3, name: "Glenn" }
  ];
  const { messages, isUnlocked, isLoading, error } = useMessages(
    selectedUser?.id
  );

  // if (isLoading) return <div>Loading messages...</div>;
  // if (error) return <div>Error loading messages: {error.message}</div>;
  // if (!isUnlocked) return <div>This chat is locked. Please pay first.</div>;
  return (
    <>
      <div className='sidebar'>
        <h2>Chats</h2>
        <ul>
          
          {user.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
        {(messages || []).map((msg, index) => (
          <div key={index} className='message'>
            <strong>{msg.sender}: </strong>
            {msg.text}
          </div>
        ))}
      </div>
      <div className='chat-window'>
        {selectedUser ? (
          <>
            <div className='chat-header'>Chat with {selectedUser.name}</div>
            <div className='chat-box'>
              {(messages[selectedUser.id] || []).map((msg, index) => (
                <div key={index} className='chat-message'>
                  <strong>{msg.sender}: </strong>
                  {msg.text}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className='no-chat'>Select a user to start chatting</div>
        )}
      </div>
    </>
  );
};

export default Messages;
