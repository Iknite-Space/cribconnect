import { useState, useEffect} from 'react'
import useGet from "./useGet";

function useMessages(thread, shouldFetch = false) {
     const url = thread
    ? `https://api.cribconnect.xyz/v1/threads/${thread.thread_id}/messages`
    : null;

  const { data, loading, error } = useGet(url, shouldFetch);

    const [messages, setMessages] = useState([]);
  console.log(thread)
  console.log(data)


  useEffect(() => {
    if (Array.isArray(data)) {
      const normalised = data.map(normalizeMsg).sort(sortByDate);
    console.log("Normalized messages:", normalised);
    setMessages(normalised);
  } 
  else if (data && typeof data === "object") {
    // single message
    const normalised = normalizeMsg(data);
    console.log("Normalized SINGLE message:", normalised);
    setMessages([normalised]); // store it as array for UI
      
    } else if (!shouldFetch) {
      console.log("nothing fetched")
      //  If we’re not fetching (e.g., no thread selected), clear list
      setMessages([]);
    }
  }, [data, shouldFetch]);

  // helper
      const normalizeMsg = (m) => ({
        id: m.message_id,
        text: m.message_text ?? "",
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        sent_at: m.sent_at ?? null,
      });
      const sortByDate = (a, b) =>
        new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime();
  return {
    messages,
    setMessages,
    isLocked: !data?.unlocked,
    isLoading: loading,
    error
  };
}

export default useMessages;
