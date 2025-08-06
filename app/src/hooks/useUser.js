import useFetch from './useFetch';

function useUser(userId) {
  const { data, loading, error } = useFetch(`/api/users/${userId}`);

  return {
    user: data,
    isLoading: loading,
    error,
    isAdmin: data?.role === 'admin'
  };

}