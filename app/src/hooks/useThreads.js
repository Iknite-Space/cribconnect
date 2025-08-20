import useFetch from "./useFetch";

function useThreads() {
  const { data, loading, error } = useFetch(
    `https://api.cribconnect.xyz/v1/user/threads` ///${user_id}
  );

  return {
    threads: data || [],
    isLoading: loading,
    error: error
  };
}

export default useThreads;
