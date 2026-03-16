/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const userData = res.data;
    setUser(userData);
    localStorage.setItem("sm_user", JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = "Bearer " + userData.token;
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sm_user");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
