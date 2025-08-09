import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          setError({
            message: `Something went wrong. ${response.status}`,
            type: "error",
            code: response.status
          });
        } else {
          const responseData = await response.json();
          setData(responseData);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]); // Empty dependency array = runs once on component mount
  return { data, loading, error };
}

export default useFetch;
