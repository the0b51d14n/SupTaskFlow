import { createContext, useContext, useState, type ReactNode } from "react";

import { logout as apiLogout } from "../api/strapiApi";
import type { User } from "../types";

interface AuthData {
  user: User | null;
  jwt: string | null;
  setAuth: (user: User, jwt: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [jwt, setJwt] = useState<string | null>(() => localStorage.getItem("jwt"));

  function setAuth(newUser: User, token: string) {
    localStorage.setItem("jwt", token);
    localStorage.setItem("user", JSON.stringify(newUser));

    setUser(newUser);
    setJwt(token);
  }

  function logout() {
    apiLogout();

    localStorage.removeItem("jwt");
    localStorage.removeItem("user");

    setUser(null);
    setJwt(null);
  }

  return (
    <AuthContext.Provider value={{ user, jwt, setAuth, logout, isLoggedIn: !!jwt }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}