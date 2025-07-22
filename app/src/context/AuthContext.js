import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refresh_token") || null);
  const [authReady, setAuthReady] = useState(false); // ✅ New flag for frontend routing
  const refreshIntervalRef = useRef(null); // ✅ Use ref for cleanup safety

  // Keep token in sync with localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    else localStorage.removeItem("refresh_token");
  }, [token, refreshToken]);

  // Logout and cleanup
  const logout = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Refresh ID token using refresh token (for backend auth)
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
      } else {
        throw new Error("Failed to refresh ID token");
      }
    } catch (error) {
      logout();
    }
  }, [refreshToken, logout]);

  // Set up refresh timer
  useEffect(() => {
    if (refreshToken && !refreshIntervalRef.current) {
      const intervalId = setInterval(() => {
        refreshIdToken();
      }, 50 * 60 * 1000); // every 50 minutes
      refreshIntervalRef.current = intervalId;
    }

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [refreshToken, refreshIdToken]);

  // Handle Firebase Google Sign-In only
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const freshToken = await user.getIdToken(true);
          const googleRefreshToken = user.refreshToken;

          setToken(freshToken);
          setRefreshToken(googleRefreshToken);
        } catch (err) {
          console.error("Failed to get Firebase token:", err);
          logout();
        }
      } else {
        logout();
      }
      setAuthReady(true); // ✅ Mark auth as ready
    });

    return () => unsubscribe();
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        refreshToken,
        setRefreshToken,
        logout,
        refreshIdToken,
        authReady, // ✅ expose readiness flag
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
