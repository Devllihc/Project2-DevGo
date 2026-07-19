import React, { createContext, useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
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
  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token")
  );
  
  const refreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const refreshSubscribersRef = useRef([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
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
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
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
        // Persist to whichever storage is currently in use
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        storage.setItem("token", res.data.token);
        storage.setItem("user", JSON.stringify(res.data.user));
        return res.data.token;
      }
      throw new Error("Refresh failed");
    } catch (error) {
      logout();
      throw error;
    }
  }, [backendUrl, logout]);

  useEffect(() => {
    if (!token) return undefined;

    refreshTimerRef.current = setInterval(refreshAccessToken, SILENT_REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshTimerRef.current);
  }, [token, refreshAccessToken]);

  // Global Axios Interceptor to catch 401s, silently refresh the token, and retry requests
  useLayoutEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401, we haven't retried yet, and it's not the refresh or login endpoint itself
        if (
          error.response?.status === 401 && 
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url.includes('/api/user/refresh') &&
          !originalRequest.url.includes('/api/user/login')
        ) {
          originalRequest._retry = true;
          
          if (!isRefreshingRef.current) {
            isRefreshingRef.current = true;
            try {
              const newToken = await refreshAccessToken();
              
              // Notify all queued requests that token is refreshed
              refreshSubscribersRef.current.forEach(cb => cb(newToken));
              refreshSubscribersRef.current = [];
              
              // Update the Authorization header for this request
              if (originalRequest.headers?.Authorization) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return axios(originalRequest);
            } catch (refreshErr) {
              // Refresh failed, notify subscribers and clear queue
              refreshSubscribersRef.current.forEach(cb => cb(null));
              refreshSubscribersRef.current = [];
              return Promise.reject(refreshErr);
            } finally {
              isRefreshingRef.current = false;
            }
          } else {
            // Wait for the active refresh to complete
            return new Promise((resolve, reject) => {
              refreshSubscribersRef.current.push((newToken) => {
                if (newToken) {
                  if (originalRequest.headers?.Authorization) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                  }
                  resolve(axios(originalRequest));
                } else {
                  reject(error);
                }
              });
            });
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshAccessToken]);

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
