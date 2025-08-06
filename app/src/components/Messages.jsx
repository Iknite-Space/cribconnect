import useMessages from '../hooks/useMessages';

const Messages = ({ selectedUser }) => {
  const { messages, isUnlocked, isLoading, error } = useMessages(selectedUser?.id);

  if (isLoading) return <div>Loading messages...</div>;
  if (error) return <div>Error loading messages: {error.message}</div>;
  if (!isUnlocked) return <div>This chat is locked. Please pay first.</div>;
  return (
    <div className='messages'>
      {(messages || []).map((msg, index) => (
        <div key={index} className='message'>
          <strong>{msg.sender}: </strong>
          {msg.text}
        </div>
      ))}
    </div>
  );
}