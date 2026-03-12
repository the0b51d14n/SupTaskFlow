import { useState } from "react";
import { login, register, logout } from "../api/strapiApi";
import type { User } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = async (email: string, password: string) => {
    const { user, jwt } = await login(email, password);

    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("jwt", jwt);

    return { user, jwt };
  };

  const handleRegister = async (
    username: string,
    email: string,
    password: string
  ) => {
    const { user, jwt } = await register(username, email, password);

    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("jwt", jwt);

    return { user, jwt };
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user");
    localStorage.removeItem("jwt");
    setUser(null);
  };

  return {
    user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}