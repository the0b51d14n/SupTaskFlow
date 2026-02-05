import { useState } from "react";

export function useAuth() {
    const [user, setUser] = useState<string | null>(null);
    const login = (email: string) => setUser(email);
    const logout = () => setUser(null);
    return { user, login, logout };
}