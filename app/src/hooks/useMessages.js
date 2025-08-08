import useFetch from "./useFetch";

function useMessages(thread_id) {
  const { data, loading, error } = useFetch(
    `https://api.cribconnect.xyz/v1/threads/:${thread_id}`
  );

  return {
    messages: data,
    isUnlocked: data?.unlocked,
    isLoading: loading,
    error
  };
}

export default useMessages;
