import React, { createContext, useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AppContext = createContext();

// Access tokens now expire after 30 minutes (see backend userController.js);
// refresh well before that so an active user is never bounced mid-session.
const SILENT_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setToken(token);
      setUser(JSON.parse(user));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${backendUrl}/api/user/logout`, {}, { withCredentials: true });
    } catch {
      // Best-effort — proceed to clear local state regardless.
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/");
  }, [backendUrl, navigate]);

  // Uses the httpOnly refresh cookie to obtain a new access token without
  // requiring the user to log in again.
  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await axios.post(`${backendUrl}/api/user/refresh`, {}, { withCredentials: true });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch {
      logout();
    }
  }, [backendUrl, logout]);

  useEffect(() => {
    if (!token) return undefined;

    refreshTimerRef.current = setInterval(refreshAccessToken, SILENT_REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshTimerRef.current);
  }, [token, refreshAccessToken]);

  const value = {
    user,
    setUser,
    token,
    setToken,
    backendUrl,
    logout,
    refreshAccessToken,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
