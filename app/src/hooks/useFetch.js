import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, refreshIdToken } = useContext(AuthContext);

 
    const fetchData = useCallback( async () => {
     
      try {
        setLoading(true);
        await refreshIdToken();
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          
          
        });

        // if (response.status === 401) {
        //   await refreshIdToken();
        //   return;
        // }
        // console.log(response)
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
     }, [token,refreshIdToken, url]);
    
    useEffect(() => {
      fetchData();
    }, [fetchData]);
    
    // Empty dependency array = runs once on component mount
  return { data, loading, error, refetch: fetchData };
}

export default useFetch;
