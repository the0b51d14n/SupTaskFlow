import { useState } from "react";
import { strapiApi } from "../api/strapiApi";

export function useAuth() {
  const [user, setUser] = useState<string | null>(() => {
    // Restaure l'utilisateur depuis le localStorage au démarrage
    return localStorage.getItem("user");
  });

  const login = async (email: string, password: string) => {
    const result = await strapiApi.login(email, password);
    if (result.success && result.email) {
      setUser(result.email);
      localStorage.setItem("user", result.email);
    }
    return result;
  };

  const register = async (email: string, password: string) => {
    const result = await strapiApi.register(email, password);
    if (result.success && result.email) {
      setUser(result.email);
      localStorage.setItem("user", result.email);
    }
    return result;
  };

  const logout = () => {
    strapiApi.logout();
    localStorage.removeItem("user");
    setUser(null);
  };

  return { user, login, register, logout };
}