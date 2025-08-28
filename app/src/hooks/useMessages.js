import useGet from "./useGet";

function useMessages(thread_id, shouldFetch = false) {
     const url = thread_id
    ? `https://api.cribconnect.xyz/v1/threads/${thread_id}/messages`
    : null;

  const { data, loading, error } = useGet(url, shouldFetch);

  return {
    messages: data || [],
    isLocked: !data?.unlocked,
    isLoading: loading,
    error
  };
}

export default useMessages;
