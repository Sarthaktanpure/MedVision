import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);
const demoAccounts = {
  "doctor@medivision.ai": {
    name: "Dr. Asha Mehta",
    email: "doctor@medivision.ai",
    role: "doctor",
    specialization: "Radiology",
  },
  "patient@medivision.ai": {
    name: "Rahul Verma",
    email: "patient@medivision.ai",
    role: "patient",
    patientId: "PAT-2026-001",
    age: 42,
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("medivision_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("medivision_token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem("medivision_token", token);
    } else {
      localStorage.removeItem("medivision_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("medivision_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("medivision_user");
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    async function boot() {
      try {
        if (token && !token.startsWith("local-")) {
          const data = await api.get("/auth/me");
          if (mounted) {
            setUser(data.user);
          }
        } else if (token && token.startsWith("local-") && user) {
          setUser(user);
        }
      } catch (_error) {
        if (mounted) {
          setToken("");
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    boot();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function login(email, password) {
    try {
      const data = await api.post("/auth/login", { email, password });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      const account = demoAccounts[email.toLowerCase()];
      if (account && ((email.toLowerCase() === "doctor@medivision.ai" && password === "doctor123") || (email.toLowerCase() === "patient@medivision.ai" && password === "patient123"))) {
        const demoUser = {
          ...account,
          _id: `local-${account.role}`,
        };
        setToken(`local-${Date.now()}`);
        setUser(demoUser);
        return demoUser;
      }
      throw error;
    }
  }

  async function register(payload) {
    try {
      const data = await api.post("/auth/register", payload);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      const demoUser = {
        _id: `local-${Date.now()}`,
        name: payload.name,
        email: payload.email.toLowerCase(),
        role: payload.role,
        patientId: payload.patientId || "PAT-2026-LOCAL",
        specialization: payload.specialization || "",
        age: Number(payload.age || 0),
        phone: payload.phone || "",
      };
      setToken(`local-${Date.now()}`);
      setUser(demoUser);
      return demoUser;
    }
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
