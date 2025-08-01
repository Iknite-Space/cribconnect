import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loginSource, setLoginSource] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const refreshIntervalRef = useRef(null);

  const fetchUserProfile = useCallback(async (idToken) => {
    try {
      const res = await fetch("https://api.cribconnect.xyz/v1/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }, []);

  // Bootstrap stored token for backend login
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRefresh = localStorage.getItem("refresh_token");
    const storedSource = localStorage.getItem("login_source");

    if (storedToken && storedRefresh && storedSource === "backend") {
      setToken(storedToken);
      setRefreshToken(storedRefresh);
      setLoginSource(storedSource);
      fetchUserProfile(storedToken);
      setAuthReady(true);
    }
  }, [fetchUserProfile]);

  // Sync tokens to localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    if (loginSource) localStorage.setItem("login_source", loginSource);
  }, [token, refreshToken, loginSource]);

  // Set authReady based on token + source
  useEffect(() => {
    const valid = token && (loginSource === "backend" || loginSource === "google");
    setAuthReady(!!valid);
  }, [token, loginSource]);

  const logout = useCallback(async () => {
    try {
      if (loginSource === "google") {
        await signOut(auth);
      }

      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("login_source");

      setToken(null);
      setRefreshToken(null);
      setLoginSource(null);
      setProfile(null);

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, [loginSource]);

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
      console.warn("Token refresh failed:", error);
      logout();
    }
  }, [refreshToken, logout]);

  useEffect(() => {
    if (refreshToken && !refreshIntervalRef.current) {
      const intervalId = setInterval(() => {
        refreshIdToken();
      }, 50 * 60 * 1000);
      refreshIntervalRef.current = intervalId;
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [refreshToken, refreshIdToken]);

  // Firebase Google login listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (loginSource === "backend") return; 
      if (user) {
        try {
          const freshToken = await user.getIdToken(true);
          setToken(freshToken);
          setLoginSource("google");
          await fetchUserProfile(freshToken);
          setAuthReady(true);
        } catch (err) {
          console.error("Firebase token error:", err);
          logout();
        }
      } else {
        logout();
      }
    });

    return () => unsubscribe();
  }, [fetchUserProfile, logout, loginSource]);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        refreshToken,
        setRefreshToken,
        loginSource,
        setLoginSource,
        logout,
        refreshIdToken,
        authReady,
        profile,
        fetchUserProfile,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
