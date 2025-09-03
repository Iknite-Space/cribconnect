import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function useDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const { token, refreshIdToken } = useContext(AuthContext);

  const deleteData = async (url) => {
    setLoading(true);
    setError(null);
    try {

        await refreshIdToken();
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Delete failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(data);
      console.log(data)
      return data;
    } catch (err) {
      setError(err);
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { deleteData, loading, error, response };
}

export default useDelete;
