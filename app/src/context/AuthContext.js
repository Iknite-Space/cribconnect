import React, { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refresh_token") || null);
  const [refreshIntervalId, setRefreshIntervalId] = useState(null);

  // Keep token in sync with localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    else localStorage.removeItem("refresh_token");
  }, [token, refreshToken]);

  const logout = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      setRefreshIntervalId(null);
    }
  }, [refreshIntervalId]);

  const refreshIdToken = useCallback(async () => {
    if (!refreshToken) return;
    try {
      const res = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=AIzaSyApDxpa0ialxo6_8xowtTG4TIBSm6AWvgc`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
        }
      );
      const data = await res.json();
      if (data.id_token) {
        setToken(data.id_token);
        localStorage.setItem("token", data.id_token);
        console.log("✅ Token refreshed proactively");
      } else {
        throw new Error("Failed to refresh ID token");
      }
    } catch (error) {
      console.error("🔁 Token refresh failed:", error);
      logout(); // Optional: log out on failure
    }
  }, [refreshToken, logout]);

  // Setup refresh timer every 50 min
  useEffect(() => {
    if (refreshToken && !refreshIntervalId) {
      const intervalId = setInterval(() => {
        refreshIdToken();
      }, 50 * 60 * 1000); // 50 minutes
      setRefreshIntervalId(intervalId);
    }

     return () => {
      if (refreshIntervalId) clearInterval(refreshIntervalId);
    };
  }, [refreshToken, refreshIdToken, refreshIntervalId]);

  return (
    <AuthContext.Provider
     value={{ 
        token,
        setToken,
        refreshToken,
        setRefreshToken,
        logout,
        refreshIdToken, 
      }}>
      {children}
    </AuthContext.Provider>
  );
};
