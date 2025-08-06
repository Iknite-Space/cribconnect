import useFetch from "./useFetch";

function useMessages(threadId) {
  const { data, loading, error } = useFetch(`/api/messages/${threadId}`);

  return {
    messages: data,
    isUnlocked: data?.unlocked,
    isLoading: loading,
    error
  };
}