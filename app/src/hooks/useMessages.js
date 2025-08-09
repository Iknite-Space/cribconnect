import useFetch from "./useFetch";

function useMessages(thread_id) {
  const { data, loading, error } = useFetch(
    `https://api.cribconnect.xyz/v1//threads/${thread_id}/messages`
  );

  return {
    messages: data || [],
    isLocked: !data?.unlocked,
    isLoading: loading,
    error
  };
}

export default useMessages;
