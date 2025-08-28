import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function useGet(url, shouldFetch = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, refreshIdToken } = useContext(AuthContext);

  useEffect(() => {
     if (!url || !shouldFetch) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await refreshIdToken();
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          setError({ message: `Error ${response.status}`, code: response.status });
        } else {
          const result = await response.json();
          setData(result);
          console.log(result)
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, shouldFetch, token, refreshIdToken]);

  return { data, loading, error };
}

export default useGet;
