/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistAuthState = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("sm_user", JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = "Bearer " + userData.token;
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    localStorage.removeItem("sm_user");
    delete api.defaults.headers.common["Authorization"];
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("sm_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed); // eslint-disable-line react-hooks/set-state-in-effect
        api.defaults.headers.common["Authorization"] =
          "Bearer " + parsed.token;
      } catch {
        localStorage.removeItem("sm_user");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthState();
    };

    window.addEventListener("sm:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("sm:unauthorized", handleUnauthorized);
    };
  }, [clearAuthState]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const userData = res.data;
    persistAuthState(userData);
    return userData;
  };

  const register = async (payload) => {
    const res = await api.post("/auth/register", payload);
    const userData = res.data;
    persistAuthState(userData);
    return userData;
  };

  const logout = () => {
    clearAuthState();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
