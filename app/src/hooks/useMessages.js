import useFetch from "./useFetch";
import { useEffect } from "react";

function useMessages(thread_id) {
  const { data, loading, error, refetch } = useFetch(
    `https://api.cribconnect.xyz/v1//thread/${thread_id}/messages`
  );


  useEffect(() => {
    if (!thread_id) return;

    const interval = setInterval(() => {
      refetch();
    }, 1000); // every 1seconds

    return () => clearInterval(interval); // cleanup on unmount or thread_id change
  }, [thread_id, refetch]);

  return {
    messages: data || [],
    isLocked: !data?.unlocked,
    isLoading: loading,
    error
  };

}
export default useMessages;
