import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function usePost() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, refreshIdToken } = useContext(AuthContext);

  const postData = async (url, body) => {
    setLoading(true);
    setError(null);
    try {
      await refreshIdToken();
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setError({ message: `Error ${res.status}`, code: res.status });
      } else {
        const result = await res.json();
        setResponse(result);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { response, loading, error, postData };
}

export default usePost;
