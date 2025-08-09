import useFetch from "./useFetch";

function useThreads(user_id) {
  const { data, loading, error } = useFetch(
    `https://api.cribconnect.xyz/v1/user/${user_id}/threads`
  );

  return {
    threads: data || [],
    isLoading: loading,
    error
  };
}

export default useThreads;
