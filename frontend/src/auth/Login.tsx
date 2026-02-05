import { useState } from "react";
import Register from "./Register";
import { mockAuth } from "../api/mockApi";

type Props = { onLogin: (user: string) => void };

export default function Login({ onLogin }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showRegister, setShowRegister] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await mockAuth.login(email, password);
        setLoading(false);
        if (res.success) onLogin(email);
        else setError(res.message || "Erreur inconnue");
    };

    if (showRegister) return <Register onRegister={() => setShowRegister(false)} />;

    return (
        <div className="auth-form">
            <h1>Connexion</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
                {error && <p className="auth-error">{error}</p>}
            </form>
            <p className="auth-message">
                Pas de compte ? <span className="auth-link" onClick={() => setShowRegister(true)}>Inscrivez-vous</span>
            </p>
        </div>
    );
}
