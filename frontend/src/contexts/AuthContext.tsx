import React, {
  createContext,
  useContext,
  useState,
  type ReactNode
} from "react";

import { logout as apiLogout } from "../api/strapiApi";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  jwt: string | null;
  setAuth: (user: User, jwt: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [jwt, setJwt] = useState<string | null>(() => {
    return localStorage.getItem("jwt");
  });

  function setAuth(newUser: User, newJwt: string) {
    localStorage.setItem("jwt", newJwt);
    localStorage.setItem("user", JSON.stringify(newUser));

    setUser(newUser);
    setJwt(newJwt);
  }

  function logout() {
    apiLogout();

    localStorage.removeItem("jwt");
    localStorage.removeItem("user");

    setUser(null);
    setJwt(null);
  }

  const value: AuthContextType = {
    user,
    jwt,
    setAuth,
    logout,
    isLoggedIn: !!jwt
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}