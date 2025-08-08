import useFetch from "./useFetch";

function useUser(user_id) {
  const { data, loading, error } = useFetch(
    `https://api.cribconnect.xyz/v1/threads/:${user_id}`
  );

  return {
    user: data,
    isLoading: loading,
    error,
    isAdmin: data?.role === "admin"
  };
}

export default useUser;
