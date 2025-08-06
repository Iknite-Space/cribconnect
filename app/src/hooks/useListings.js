function useListings() {
  const { data, loading, error } = useFetch(`/api/listings`);

  return {
    listings: data,
    isLoading: loading,
    error
  };
}
